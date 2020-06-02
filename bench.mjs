import * as WebMKLC from "./webmkl-c.mjs";
import * as WebMKLJS from "./webmkl-js.mjs";

/**
 * @param {number} m
 * @param {number} n
 * @param {number} k
 */
function test_dgemm(m, n, k) {
  // m * k matrix
  const A1 = new Float64Array(m * k);
  // k * n matrix
  const B1 = new Float64Array(k * n);

  const lda = m;
  const ldb = k;
  const ldc = m;

  // m * n matrix
  const C1 = new Float64Array(m * n);

  const nrepeats = 3;

  for (let p = 0; p < k; p++) {
    for (let i = 0; i < m; i++) {
      A1[p * lda + i] = Math.random();
    }
  }

  for (let j = 0; j < n; j++) {
    for (let p = 0; p < k; p++) {
      B1[j * ldb + p] = Math.random();
    }
  }
  const A2 = WebMKLC.ManagedFloat64Array.copied(A1);
  const B2 = WebMKLC.ManagedFloat64Array.copied(B1);
  const C2 = new WebMKLC.ManagedFloat64Array(m * n);

  let best1 = Infinity;
  let best2 = Infinity;

  for (let i = 0; i < nrepeats; i++) {
    const begin = process.hrtime();
    WebMKLJS.dgemm(m, n, k, A1, lda, B1, ldb, C1, ldc);
    const [duration_s, duration_ns] = process.hrtime(begin);
    const duration = duration_s + duration_ns / 10 ** 9;
    best1 = duration < best1 ? duration : best1;
  }

  for (let i = 0; i < nrepeats; i++) {
    const begin = process.hrtime();
    WebMKLC.dgemm(m, n, k, A2, lda, B2, ldb, C2, ldc);
    const [duration_s, duration_ns] = process.hrtime(begin);
    const duration = duration_s + duration_ns / 10 ** 9;
    best2 = duration < best2 ? duration : best2;
  }

  // console.debug(C2);

  // // Check that the implementations are equal
  for (let i = 0; i < C1.length; i++) {
    if (Math.abs(C1[i] - C2[i]) > 1e-10) {
      console.warn("WARNING: C1[i] = %d but C2[i] = %d", C1[i], C2[i]);
    }
  }

  const flops = ((m * n) / (1000.0 * 1000.0 * 1000.0)) * (2 * k);

  console.info(
    "%i,%i,%i,%s,%s",
    m,
    n,
    k,
    (flops / Number(best1)).toFixed(5),
    (flops / Number(best2)).toFixed(5)
  );

  A2.free();
  B2.free();
  C2.free();
}

const BLOCK_SIZE = 16;
const MIN_SIZE = 16;
const MAX_SIZE = 1024;

console.info("m,n,k,gflops_js,gflops_wasm");

for (let i = MIN_SIZE; i <= MAX_SIZE; i += BLOCK_SIZE) {
  test_dgemm(i, i, i);
}
