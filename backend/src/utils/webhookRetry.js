module.exports.getRetryDelay = (attempt) => {
  const testMode = process.env.WEBHOOK_RETRY_INTERVALS_TEST === 'true';

  const prod = [0, 60, 300, 1800, 7200];
  const test = [0, 5, 10, 15, 20];

  const delays = testMode ? test : prod;
  return (delays[attempt] || 0) * 1000;
};


