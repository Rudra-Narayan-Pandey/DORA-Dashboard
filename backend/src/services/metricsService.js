const deploymentService = require('./deploymentService');
const incidentService = require('./incidentService');
const { cacheService, generateKey } = require('./cacheService');
const { getDateRangeStart } = require('../utils/dateUtils');
const { 
  getDeploymentFrequencyRating, 
  getLeadTimeRating, 
  getChangeFailureRateRating, 
  getMeanTimeToRestoreRating 
} = require('../utils/metricUtils');
const logger = require('../utils/logger');

// Cache DORA metrics for 5 minutes (300 seconds)
const METRICS_TTL = 300;

/**
 * Splits a list of items into N equal time buckets over a date range.
 * Helper for generating sparklines.
 */
const partitionIntoBuckets = (items, startDate, endDate, bucketCount = 7) => {
  const start = startDate ? startDate.getTime() : Math.min(...items.map(i => new Date(i.timestamp).getTime()), Date.now() - 30 * 24 * 3600000);
  const end = endDate.getTime();
  const step = (end - start) / bucketCount;
  
  const buckets = Array.from({ length: bucketCount }, () => []);
  
  items.forEach(item => {
    const time = new Date(item.timestamp).getTime();
    if (time >= start && time <= end) {
      const index = Math.min(bucketCount - 1, Math.floor((time - start) / step));
      if (index >= 0) {
        buckets[index].push(item);
      }
    }
  });
  
  return buckets;
};

const metricsService = {
  /**
   * Calculates DORA metrics based on Azure DevOps telemetry data.
   * Compiles DF, LT, CFR, and MTTR for both the current timeframe and the prior control window.
   * 
   * @param {object} req Express request context
   * @param {object} filters Query parameters (dateRange, environment)
   * @returns {Promise<object>} DORA metrics payload
   */
  getMetrics: async (req, filters = {}) => {
    const cacheKey = generateKey(req.azurePat, 'dora_metrics', filters);
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      logger.info('Serving DORA metrics from cache.');
      return cachedData;
    }

    const startTime = Date.now();
    
    // Resolve dates
    const dateRange = filters.dateRange || '7d';
    const end = new Date();
    const start = getDateRangeStart(dateRange) || new Date(Date.now() - 30 * 24 * 3600000); // default to 30 days if 'all'
    const durationMs = end.getTime() - start.getTime();
    const days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

    // Calculate historical control range (for trends)
    const prevStart = new Date(start.getTime() - durationMs);
    const prevEnd = start;

    try {
      // Fetch deployments and incidents in parallel
      // We pass limit=1000 to get a comprehensive history for aggregations
      const [deploymentsResult, incidentsResult] = await Promise.all([
        deploymentService.getDeployments(req, { ...filters, page: 1, limit: 1000 }),
        incidentService.getIncidents(req, { ...filters, page: 1, limit: 1000 })
      ]);

      const allDeployments = deploymentsResult.data || [];
      const allIncidents = incidentsResult.data || [];

      // Filter data for the current timeframe
      const currentDeps = allDeployments.filter(d => {
        const time = new Date(d.timestamp).getTime();
        return time >= start.getTime() && time <= end.getTime();
      });
      const currentIncidents = allIncidents.filter(i => {
        const time = new Date(i.detectedAt).getTime();
        return time >= start.getTime() && time <= end.getTime();
      });

      // Filter data for the prior timeframe (for trends)
      const prevDeps = allDeployments.filter(d => {
        const time = new Date(d.timestamp).getTime();
        return time >= prevStart.getTime() && time <= prevEnd.getTime();
      });
      const prevIncidents = allIncidents.filter(i => {
        const time = new Date(i.detectedAt).getTime();
        return time >= prevStart.getTime() && time <= prevEnd.getTime();
      });

      // ------------------------------------------------------------
      // 1. DEPLOYMENT FREQUENCY (DF)
      // ------------------------------------------------------------
      const currentSuccessDeps = currentDeps.filter(d => d.status === 'success');
      const prevSuccessDeps = prevDeps.filter(d => d.status === 'success');
      
      const dfVal = currentSuccessDeps.length / days;
      const prevDfVal = prevSuccessDeps.length / days;
      const dfTrend = prevDfVal > 0 ? parseFloat((((dfVal - prevDfVal) / prevDfVal) * 100).toFixed(1)) : 0;
      
      // Sparkline buckets
      const dfBuckets = partitionIntoBuckets(currentSuccessDeps, start, end);
      const dfSparkline = dfBuckets.map(b => b.length);

      // ------------------------------------------------------------
      // 2. LEAD TIME FOR CHANGES (LT)
      // ------------------------------------------------------------
      const getAvgLeadTime = (deps) => {
        if (deps.length === 0) return 0;
        const deploymentsWithDuration = deps.filter(d => Number.isFinite(Number(d.duration)) && Number(d.duration) > 0);
        if (deploymentsWithDuration.length === 0) return 0;
        const totalHours = deploymentsWithDuration.reduce((sum, d) => sum + (Number(d.duration) / 3600), 0);
        return parseFloat((totalHours / deploymentsWithDuration.length).toFixed(4));
      };

      const ltVal = getAvgLeadTime(currentSuccessDeps);
      const prevLtVal = getAvgLeadTime(prevSuccessDeps);
      const ltTrend = parseFloat((ltVal - prevLtVal).toFixed(1)); // difference in hours

      const ltBuckets = partitionIntoBuckets(currentSuccessDeps, start, end);
      const ltSparkline = ltBuckets.map(b => getAvgLeadTime(b));

      // ------------------------------------------------------------
      // 3. CHANGE FAILURE RATE (CFR)
      // ------------------------------------------------------------
      const getCfr = (deps) => {
        if (deps.length === 0) return 0;
        const failed = deps.filter(d => d.status === 'failed').length;
        return (failed / deps.length) * 100;
      };

      const cfrVal = getCfr(currentDeps);
      const prevCfrVal = getCfr(prevDeps);
      const cfrTrend = parseFloat((cfrVal - prevCfrVal).toFixed(1));

      const cfrBuckets = partitionIntoBuckets(currentDeps, start, end);
      const cfrSparkline = cfrBuckets.map(b => parseFloat(getCfr(b).toFixed(1)));

      // ------------------------------------------------------------
      // 4. MEAN TIME TO RESTORE (MTTR)
      // ------------------------------------------------------------
      const getMttr = (incidents) => {
        const resolved = incidents.filter(i => i.status === 'resolved');
        if (resolved.length === 0) return 0;
        const sumDuration = resolved.reduce((sum, i) => sum + (i.duration || 0), 0);
        return Math.round(sumDuration / resolved.length);
      };

      const mttrVal = getMttr(currentIncidents);
      const prevMttrVal = getMttr(prevIncidents);
      const mttrTrend = parseFloat((mttrVal - prevMttrVal).toFixed(1));

      const mttrBuckets = partitionIntoBuckets(currentIncidents, start, end);
      const mttrSparkline = mttrBuckets.map(b => getMttr(b));

      const deploymentsWithDuration = currentSuccessDeps.filter(d => Number.isFinite(Number(d.duration)) && Number(d.duration) > 0);
      const deployMins = deploymentsWithDuration.length > 0
        ? Math.round(deploymentsWithDuration.reduce((sum, d) => sum + Number(d.duration), 0) / deploymentsWithDuration.length / 60)
        : 0;

      const totalLeadMins = Math.round(ltVal * 60);
      const devMins = Math.max(0, Math.round(totalLeadMins * 0.5));
      const buildMins = Math.max(0, Math.round(totalLeadMins * 0.15));
      const testMins = Math.max(0, Math.round(totalLeadMins * 0.25));

      const stageStatus = (value, warningThreshold, dangerThreshold) => {
        if (value === 0) return 'NO DATA';
        if (value >= dangerThreshold) return 'DELAYED';
        if (value >= warningThreshold) return 'SLOW';
        return 'READY';
      };

      const stageHealth = (value, warningThreshold, dangerThreshold) => {
        if (value === 0) return 0;
        if (value >= dangerThreshold) return 1;
        if (value >= warningThreshold) return 2;
        return 4;
      };

      const devStatus = stageStatus(devMins, 240, 480);
      const devHealth = stageHealth(devMins, 240, 480);

      const buildStatus = stageStatus(buildMins, 10, 20);
      const buildHealth = stageHealth(buildMins, 10, 20);

      const testStatus = stageStatus(testMins, 20, 40);
      const testHealth = stageHealth(testMins, 20, 40);

      const deployStatus = stageStatus(deployMins, 15, 60);
      const deployHealth = stageHealth(deployMins, 15, 60);

      // ------------------------------------------------------------
      // Assemble final DORA Metrics payload
      // ------------------------------------------------------------
      const metrics = {
        stages: {
          development: { duration: `${devMins}m`, status: devStatus, healthIndex: devHealth },
          build: { duration: `${buildMins}m`, status: buildStatus, healthIndex: buildHealth },
          test: { duration: `${testMins}m`, status: testStatus, healthIndex: testHealth },
          deploy: { duration: `${deployMins}m`, status: deployStatus, healthIndex: deployHealth }
        },
        totalDeployments: currentDeps.length,
        totalSuccessfulDeployments: currentSuccessDeps.length,
        totalIncidents: currentIncidents.length,
        deploymentFrequency: {
          value: dfVal.toFixed(1),
          unit: 'deploys/day',
          rating: getDeploymentFrequencyRating(dfVal),
          trend: dfTrend,
          trendDirection: dfTrend >= 0 ? 'up' : 'down',
          sparkline: dfSparkline
        },
        leadTime: {
          value: ltVal.toString(),
          unit: 'hours',
          rating: getLeadTimeRating(ltVal),
          trend: ltTrend,
          trendDirection: ltTrend <= 0 ? 'down' : 'up', // down trend is a positive optimization
          sparkline: ltSparkline
        },
        changeFailureRate: {
          value: cfrVal.toFixed(1),
          unit: '%',
          rating: getChangeFailureRateRating(cfrVal),
          trend: cfrTrend,
          trendDirection: cfrTrend <= 0 ? 'down' : 'up', // down trend is a positive reduction in failures
          sparkline: cfrSparkline
        },
        meanTimeToRestore: {
          value: mttrVal.toString(),
          unit: 'mins',
          rating: getMeanTimeToRestoreRating(mttrVal),
          trend: mttrTrend,
          trendDirection: mttrTrend <= 0 ? 'down' : 'up', // down trend is a positive reduction in resolution times
          sparkline: mttrSparkline
        }
      };

      const duration = Date.now() - startTime;
      logger.info('DORA metrics calculations completed', duration);

      cacheService.set(cacheKey, metrics, METRICS_TTL);
      return metrics;
    } catch (error) {
      logger.error('Failed to compile DORA metrics calculations', error);
      throw error;
    }
  },

  getTrends: async (req, period = 'weekly', query = {}) => {
    const cacheKey = generateKey(req.azurePat, `trends_${period}`, query);
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const startTime = Date.now();
    const dateRange = query.dateRange || '7d';
    const envFilter = query.environment || 'All';

    try {
      // Fetch full history to compile trends
      const [deploymentsResult, incidentsResult] = await Promise.all([
        deploymentService.getDeployments(req, { limit: 1000 }),
        incidentService.getIncidents(req, { limit: 1000 })
      ]);

      const deployments = deploymentsResult.data || [];
      const incidents = incidentsResult.data || [];

      let trends = [];

      if (period.toLowerCase() === 'monthly') {
        // Compile last 12 months of trends
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        
        trends = Array.from({ length: 12 }, (_, index) => {
          const targetMonthIndex = (now.getMonth() - (11 - index) + 12) % 12;
          const monthLabel = months[targetMonthIndex];
          
          // Get target year
          let year = now.getFullYear();
          if (now.getMonth() - (11 - index) < 0) {
            year -= 1;
          }

          // Filter items falling within this month/year and environment
          let monthDeps = deployments.filter(d => {
            const date = new Date(d.timestamp);
            return date.getMonth() === targetMonthIndex && date.getFullYear() === year;
          });
          let monthIncidents = incidents.filter(i => {
            const date = new Date(i.detectedAt);
            return date.getMonth() === targetMonthIndex && date.getFullYear() === year;
          });

          if (envFilter !== 'All') {
            monthDeps = monthDeps.filter(d => d.environment.toLowerCase() === envFilter.toLowerCase());
            monthIncidents = monthIncidents.filter(i => i.environment.toLowerCase() === envFilter.toLowerCase());
          }

          // Calculate metrics
          const successDeps = monthDeps.filter(d => d.status === 'success');
          const failedDeps = monthDeps.filter(d => d.status === 'failed');
          const resolvedIncidents = monthIncidents.filter(i => i.status === 'resolved');

          const successDepsWithDuration = successDeps.filter(d => Number.isFinite(Number(d.duration)) && Number(d.duration) > 0);
          const leadTimeAvg = successDepsWithDuration.length > 0
            ? parseFloat((successDepsWithDuration.reduce((sum, d) => sum + (Number(d.duration) / 3600), 0) / successDepsWithDuration.length).toFixed(1))
            : 0;
            
          const failureRate = monthDeps.length > 0
            ? parseFloat(((failedDeps.length / monthDeps.length) * 100).toFixed(1))
            : 0;
            
          const mttrAvg = resolvedIncidents.length > 0
            ? Math.round(resolvedIncidents.reduce((sum, i) => sum + (i.duration || 0), 0) / resolvedIncidents.length)
            : 0;

          return {
            month: monthLabel,
            deployments: monthDeps.length,
            incidents: monthIncidents.length,
            leadTime: leadTimeAvg,
            failureRate,
            mttr: mttrAvg
          };
        });

      } else {
        // Compile dynamic number of days based on dateRange (7, 30, or 90 days)
        let daysCount = 7;
        if (dateRange === '30d') daysCount = 30;
        if (dateRange === '90d') daysCount = 90;

        const now = new Date();

        trends = Array.from({ length: daysCount }, (_, index) => {
          const targetDay = new Date();
          targetDay.setDate(now.getDate() - (daysCount - 1 - index));
          const dayLabel = targetDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          // Filter items falling on this specific day and environment
          let dayDeps = deployments.filter(d => {
            const date = new Date(d.timestamp);
            return date.toDateString() === targetDay.toDateString();
          });
          let dayIncidents = incidents.filter(i => {
            const date = new Date(i.detectedAt);
            return date.toDateString() === targetDay.toDateString();
          });

          if (envFilter !== 'All') {
            dayDeps = dayDeps.filter(d => d.environment.toLowerCase() === envFilter.toLowerCase());
            dayIncidents = dayIncidents.filter(i => i.environment.toLowerCase() === envFilter.toLowerCase());
          }

          const successDeps = dayDeps.filter(d => d.status === 'success');
          const failedDeps = dayDeps.filter(d => d.status === 'failed');
          const resolvedIncidents = dayIncidents.filter(i => i.status === 'resolved');

          const successDepsWithDuration = successDeps.filter(d => Number.isFinite(Number(d.duration)) && Number(d.duration) > 0);
          const leadTimeAvg = successDepsWithDuration.length > 0
            ? parseFloat((successDepsWithDuration.reduce((sum, d) => sum + (Number(d.duration) / 3600), 0) / successDepsWithDuration.length).toFixed(1))
            : 0;
            
          const failureRate = dayDeps.length > 0
            ? parseFloat(((failedDeps.length / dayDeps.length) * 100).toFixed(1))
            : 0;
            
          const mttrAvg = resolvedIncidents.length > 0
            ? Math.round(resolvedIncidents.reduce((sum, i) => sum + (i.duration || 0), 0) / resolvedIncidents.length)
            : 0;

          return {
            day: dayLabel,
            deployments: dayDeps.length,
            incidents: dayIncidents.length,
            leadTime: leadTimeAvg,
            failureRate,
            mttr: mttrAvg
          };
        });
      }

      const duration = Date.now() - startTime;
      logger.info(`Trends compiled for period "${period}": ${trends.length} points generated`, duration);

      cacheService.set(cacheKey, trends, METRICS_TTL);
      return trends;
    } catch (error) {
      logger.error('Failed to compile metrics trends history', error);
      throw error;
    }
  }
};

module.exports = metricsService;
