import * as WebMKLC from "./webmkl-c.mjs";
import * as WebMKLJS from "./webmkl-js.mjs";
import { PerformanceObserver, performance } from "perf_hooks";

function run_dscal_js(...args) {
  WebMKLJS.dscal(...args);
}

function run_dscal_wasm(...args) {
  WebMKLC.dscal(...args);
}

/**
 * @param {number} m
 * @param {number} n
 * @param {number} k
 */
function test_dscal(n) {
  const v0 = new Float64Array(n);

  const nrepeats = 10000;

  for (let i = 0; i < n; i++) {
    v0[i] = Math.random();
  }

  const v1 = Float64Array.from(v0);

  const a = Math.random();

  let best1 = Infinity;
  let best2 = Infinity;

  for (let i = 0; i < nrepeats; i++) {
    const begin = performance.now();
    run_dscal_js(n, a, v0);
    const duration = (performance.now() - begin) / 1000;
    best1 = Math.min(best1, duration);
  }

  for (let i = 0; i < nrepeats; i++) {
    const begin = performance.now();
    run_dscal_wasm(n, a, v1);
    const duration = (performance.now() - begin) / 1000;
    best2 = Math.min(best2, duration);
  }

  // console.debug(C2);

  // // Check that the implementations are equal
  for (let i = 0; i < v0.length; i++) {
    if (Math.abs(v0[i] - v1[i]) > 1 ** -10) {
      throw new Error(`index ${i}: v0[i] = ${C1[i]}, v1[i] = ${C2[i]}`);
    }
  }

  const flops = n / (1000.0 * 1000.0 * 1000.0);

  console.info(
    "%i,%s,%s",
    n,
    (flops / Number(best1)).toFixed(5),
    (flops / Number(best2)).toFixed(5)
  );

  // A2.dispose();
  // B2.dispose();
  // C2.dispose();
}

const BLOCK_SIZE = 16;
const MIN_SIZE = 16;
const MAX_SIZE = 1024;

const performanceObserver = new PerformanceObserver((observer) => {
  console.warn("observed a PerformanceEvent");
});
performanceObserver.observe({ entryTypes: ["gc"] });

console.info("m,javascript,wasm");

for (let i = MIN_SIZE; i <= MAX_SIZE; i += BLOCK_SIZE) {
  test_dscal(i);
  global.gc?.(true);
}
