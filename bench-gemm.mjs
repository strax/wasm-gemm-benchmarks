import * as WebMKLC from "./webmkl-c.mjs";
import * as WebMKLJS from "./webmkl-js.mjs";
import { PerformanceObserver } from "perf_hooks";

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
  const A2 = Float64Array.from(A1);
  const B2 = Float64Array.from(B1);
  const C2 = Float64Array.from(C1);

  let best1 = Infinity;
  let best2 = Infinity;

  for (let i = 0; i < nrepeats; i++) {
    const begin = process.hrtime();
    WebMKLJS.dgemm(m, n, k, A1, lda, B1, ldb, C1, ldc);
    const [duration_s, duration_ns] = process.hrtime(begin);
    const duration = duration_s + duration_ns / 10 ** 9;
    best1 = Math.min(best1, duration);
  }

  for (let i = 0; i < nrepeats; i++) {
    const begin = process.hrtime();
    WebMKLC.dgemm(m, n, k, A2, lda, B2, ldb, C2, ldc);
    const [duration_s, duration_ns] = process.hrtime(begin);
    const duration = duration_s + duration_ns / 10 ** 9;
    best2 = Math.min(best2, duration);
  }

  // console.debug(C2);

  // // Check that the implementations are equal
  for (let i = 0; i < C1.length; i++) {
    if (Math.abs(C1[i] - C2[i]) > 1 ** -10) {
      throw new Error(`index ${i}: C1[i] = ${C1[i]}, C2[i] = ${C2[i]}`);
    }
  }

  const flops = ((m * n) / (1000.0 * 1000.0 * 1000.0)) * (2 * k);

  console.info(
    "%i,%s,%s",
    m,
    (flops / Number(best1)).toFixed(5),
    (flops / Number(best2)).toFixed(5)
  );

  // A2.dispose();
  // B2.dispose();
  // C2.dispose();
}

const BLOCK_SIZE = 16;
const MIN_SIZE = 16;
const MAX_SIZE = 512;

const performanceObserver = new PerformanceObserver((observer) => {
  console.warn("observed a PerformanceEvent");
});
performanceObserver.observe({ entryTypes: ["gc"] });

console.info("m,javascript,wasm");

for (let i = MIN_SIZE; i <= MAX_SIZE; i += BLOCK_SIZE) {
  test_dgemm(i, i, i);
  global.gc?.(true);
}
