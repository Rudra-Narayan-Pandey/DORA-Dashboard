export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const truncateString = (str, num) => {
  if (!str) return '';
  if (str.length <= num) return str;
  return str.slice(0, num) + '...';
};

export const generateHash = () => {
  return Math.random().toString(16).substring(2, 9);
};
