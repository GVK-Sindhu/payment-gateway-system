
export const generateId = (prefix) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let random = '';
  for (let i = 0; i < 16; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${random}`;
};

export function generateRefundId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let random = '';
  for (let i = 0; i < 16; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `rfnd_${random}`;
}
