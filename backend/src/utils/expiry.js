export const isValidExpiry = (month, year) => {
  month = parseInt(month, 10);
  year = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const expiry = new Date(year, month);

  return expiry >= new Date(now.getFullYear(), now.getMonth());
};
