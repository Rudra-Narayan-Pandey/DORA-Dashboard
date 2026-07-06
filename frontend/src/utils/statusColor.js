export const getStatusColorClasses = (status) => {
  const norm = status?.toLowerCase();
  switch (norm) {
    case 'success':
    case 'resolved':
      return {
        bg: 'rgba(5, 255, 196, 0.1)',
        border: 'rgba(5, 255, 196, 0.3)',
        text: 'text-dora-green',
        glow: 'shadow-neon-green',
        dot: 'bg-dora-green'
      };
    case 'failed':
    case 'critical':
      return {
        bg: 'rgba(255, 42, 95, 0.1)',
        border: 'rgba(255, 42, 95, 0.3)',
        text: 'text-dora-rose',
        glow: 'shadow-neon-rose',
        dot: 'bg-dora-rose'
      };
    case 'rolling_back':
    case 'major':
    case 'investigating':
      return {
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
        text: 'text-dora-yellow',
        glow: 'shadow-neon-yellow',
        dot: 'bg-dora-yellow'
      };
    case 'in_progress':
    case 'minor':
    case 'canary':
    default:
      return {
        bg: 'rgba(0, 242, 254, 0.1)',
        border: 'rgba(0, 242, 254, 0.3)',
        text: 'text-dora-cyan',
        glow: 'shadow-neon-cyan',
        dot: 'bg-dora-cyan'
      };
  }
};
