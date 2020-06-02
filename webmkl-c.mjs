import * as FS from "fs";

// const MEMORY = new WebAssembly.Memory({ initial: 2 });

const { instance } = await WebAssembly.instantiate(
  FS.readFileSync("webmkl-c/blas.wasm")
  // { env: { memory: MEMORY } }
);

const MEMORY = instance.exports.memory;
const MEMORY_F32 = new Float32Array(MEMORY.buffer, 0);

export function calloc(n, size) {
  return instance.exports.calloc(n, size);
}

export function free(ptr) {
  return instance.exports.free(ptr);
}

const FINALIZATION_GROUP = new FinalizationGroup(free);

export class ManagedFloat64Array extends Float64Array {
  /**
   *
   * @param {Float64Array} buffer
   */
  static copied(buffer) {
    const xs = new ManagedFloat64Array(buffer.length);
    xs.set(buffer);
    return xs;
  }

  static of(...elements) {
    const arr = new ManagedFloat64Array(elements.length);
    arr.set(elements);
    return arr;
  }

  /**
   * @param {number} length
   */
  constructor(length) {
    const ptr = calloc(length, Float64Array.BYTES_PER_ELEMENT);
    super(MEMORY.buffer, ptr, length);
    // FINALIZATION_GROUP.register(this, ptr);
  }

  free() {
    free(this.byteOffset);
  }
}

export class ManagedFloat32Array extends Float32Array {
  static of(...elements) {
    const arr = new ManagedFloat32Array(elements.length);
    arr.set(elements);
    return arr;
  }

  /**
   * @param {number} length
   */
  constructor(length) {
    const ptr = calloc(length, Float32Array.BYTES_PER_ELEMENT);
    super(MEMORY.buffer, ptr, length);
    // FINALIZATION_GROUP.register(this, ptr);
  }
}

export function newFloat64Array(n) {
  return new Float64Array(MEMORY.buffer, 0, n);
}

/**
 * @param {number} a
 * @param {Float32Array} xs
 */
export function sscal(a, xs) {
  instance.exports.sscal(xs.length, a, xs.byteOffset);
}

/**
 * @param {number} a
 * @param {Float64Array} xs
 */
export function dscal(n, a, xs) {
  instance.exports.dscal(n, a, xs.byteOffset);
}

/**
 * @param {number} a
 * @param {Float32Array} xs
 */
export function sasum(n, xs, incx) {
  return instance.exports.sasum(n, xs.byteOffset, incx);
}

/**
 * @param {number} a
 * @param {Float64Array} xs
 */
export function dasum(n, xs, incx) {
  return instance.exports.dasum(n, xs.byteOffset, incx);
}

// void dgemm(const i32_t transa, const i32_t transb, const i32_t m, const i32_t n, const i32_t k, const f64_t alpha, const f64_t *a, const i32_t lda, const f64_t *b, const i32_t ldb, const i64_t beta, i64_t *c, const i32_t ldc)

export const NO_TRANS = 0;
export const TRANS = 1;
export const CONJ_TRANS = 2;

/**
 *
 * @param {number} m Row count of A
 * @param {number} n Row count of A
 * @param {number} k Column count of C
 * @param {Float64Array} A Matrix A
 * @param {number} lda Row count of A
 * @param {Float64Array} B Matrix B
 * @param {number} ldb Row count of B
 * @param {Float64Array} C Matrix C
 * @param {number} ldc Row count of C
 */
export function dgemm(m, n, k, A, lda, B, ldb, C, ldc) {
  instance.exports.dgemm(
    m,
    n,
    k,
    A.byteOffset,
    lda,
    B.byteOffset,
    ldb,
    C.byteOffset,
    ldc
  );
}
