/**
 * @param {number} n
 * @param {number} n
 * @param {Float64Array} xs
 */
export function dscal(n, a, xs) {
  for (let i = 0; i < n; i++) {
    xs[i] += a;
  }
}

/**
 * @param {number} n
 * @param {Float64Array} xs
 * @param {number} incx
 */
export function dasum(n, xs, incx) {
  let asum = 0.0;
  for (let i = 0; i < n * incx; i += incx) {
    asum += Math.abs(xs[i]);
  }
  return asum;
}

/**
 *
 * @param {number} m
 * @param {number} n
 * @param {number} k
 * @param {Float64Array} A
 * @param {number} lda
 * @param {Float64Array} B
 * @param {number} ldb
 * @param {Float64Array} C
 * @param {number} ldc
 */
export function dgemm(m, n, k, A, lda, B, ldb, C, ldc) {
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      for (let p = 0; p < k; p++) {
        C[j * ldc + i] += A[p * lda + i] * B[j * ldb + p];
      }
    }
  }
}
