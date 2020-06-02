import * as WebMKL from "./webmkl-c.mjs";
import * as assert from "assert";

function test_sasum_1() {
  const vec = WebMKL.ManagedFloat32Array.of(
    -1,
    2,
    -3,
    -4,
    5,
    -6,
    7,
    -8,
    9,
    -10
  );
  assert.strictEqual(WebMKL.sasum(10, vec, 1), 55.0);
  console.debug("test_sasum_1: pass");
}

function test_sasum_2() {
  const vec = WebMKL.ManagedFloat32Array.of(1, 2, -3, -4, -5, 6, 7, 8, 9, 10);
  assert.strictEqual(WebMKL.sasum(5, vec, 2), 25.0);
  console.debug("test_sasum_2: pass");
}

function test_dasum_1() {
  const vec = WebMKL.ManagedFloat64Array.of(
    -1,
    2,
    -3,
    -4,
    5,
    -6,
    7,
    -8,
    9,
    -10
  );
  assert.strictEqual(WebMKL.dasum(10, vec, 1), 55.0);
  console.debug("test_dasum_1: pass");
}

function test_dasum_2() {
  const vec = WebMKL.ManagedFloat64Array.of(1, 2, -3, -4, -5, 6, 7, 8, 9, 10);
  assert.strictEqual(WebMKL.dasum(5, vec, 2), 25.0);
  console.debug("test_dasum_2: pass");
}

function test_gemm_small_data() {
  // Matrix A (LHS): 3x4
  // 7 10 13 16
  // 8 11 14 17
  // 9 12 15 18
  const A = WebMKL.ManagedFloat64Array.of(
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18
  );
  // Matrix B (RHS): 2x3
  // 1 3 5
  // 2 4 6
  const B = WebMKL.ManagedFloat64Array.of(1, 2, 3, 4, 5, 6);

  // Expected: 2x4
  //  76 103 130 157
  // 100 136 172 208
  const expected = Float64Array.of(76, 100, 103, 136, 130, 172, 157, 208);

  const m = 4;
  const n = 2;
  const k = 3;

  const output = new WebMKL.ManagedFloat64Array(m * n);

  const lda = k;
  const ldb = n;
  const ldc = n;
}

test_sasum_1();
test_sasum_2();
test_dasum_1();
test_dasum_2();
