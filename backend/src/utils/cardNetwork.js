export const detectCardNetwork = (num) => {
  const n = num.replace(/[\s-]/g, '');
  if (n.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^(60|65|8[1-9])/.test(n)) return 'rupay';
  return 'unknown';
};
