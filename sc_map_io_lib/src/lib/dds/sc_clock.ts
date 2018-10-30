/**
 * Benchmarking utility.
 * @param {Array} start If undefined/null the current time is returned
 *                      If defined the number of milliseconds elapsed is returned
 * @example
 * const start = clock();
 * // Slow process here
 * const durationMs = clock(start);
 */
export const clock = function(start?: [number, number]) {
  if (!start) return process.hrtime();
  let end = process.hrtime(start);
  return Math.round((end[0] * 1000) + (end[1]/1000000));
};
