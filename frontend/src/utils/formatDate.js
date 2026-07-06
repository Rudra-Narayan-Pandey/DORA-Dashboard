import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDateTime = (date) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

export const formatDate = (date) => {
  if (!date) return '-';
  return dayjs(date).format('MMM DD, YYYY');
};

export const formatTime = (date) => {
  if (!date) return '-';
  return dayjs(date).format('HH:mm:ss');
};

export const getRelativeTime = (date) => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};
