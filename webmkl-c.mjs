import * as FS from "fs";

// const MEMORY = new WebAssembly.Memory({ initial: 2 });

const { instance } = await WebAssembly.instantiate(
  FS.readFileSync("webmkl-c/blas.wasm")
);

export const MEMORY = instance.exports.memory;
const HEAP_BASE = instance.exports.__heap_base;

export function calloc(n, size) {
  return instance.exports.blas_calloc(n, size);
}

export function malloc(size) {
  return instance.exports.blas_malloc(size);
}

export function free(ptr) {
  return instance.exports.blas_free(ptr);
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
    console.trace("new ManagedFloat64Array(%d)", length);
    const ptr = calloc(length, Float64Array.BYTES_PER_ELEMENT);
    console.debug("ptr = %d", ptr);
    super(MEMORY.buffer, ptr, length);
    // FINALIZATION_GROUP.register(this, ptr);
  }

  dispose() {
    // FINALIZATION_GROUP.unregister(this);
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
    console.debug("ptr = %d", ptr);
    super(MEMORY.buffer, HEAP_BASE + ptr, length);
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
 * @param {Float64Array} v
 */
export function dscal(n, a, v) {
  if (n > 256) {
    const vp = malloc(v.byteLength);
    copyTo(vp, v);
    instance.exports.dscal(n, a, vp);
    v.set(new Float64Array(MEMORY.buffer, vp, n));
    free(vp);
  } else {
    for (let i = 0; i < n; i++) {
      v[i] += +a;
    }
  }
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
 * Copies `buffer` to the current linear memory of the WASM instance.
 * @param {number} ptr
 * @param {ArrayBuffer | ArrayBufferView} buffer
 */
function copyTo(ptr, buffer) {
  new Uint8Array(MEMORY.buffer).set(
    new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength),
    ptr
  );
}

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
  // Allocate a single contiguous block of memory for all of the matrices
  const ap = malloc(A.byteLength + B.byteLength + C.byteLength);
  const bp = ap + A.byteLength;
  const cp = bp + C.byteLength;
  // console.debug("ap = %d, bp = %d, cp = %d", ap, bp, cp);
  copyTo(ap, A);
  copyTo(bp, B);
  copyTo(cp, C);
  // console.debug("A = %o", new Float64Array(MEMORY.buffer, ap, A.length));
  // console.debug("B = %o", new Float64Array(MEMORY.buffer, bp, B.length));
  // console.debug("C = %o", new Float64Array(MEMORY.buffer, cp, C.length));
  instance.exports.dgemm(m, n, k, ap, lda, bp, ldb, cp, ldc);
  // console.debug(
  //   "RESULT = %o",
  //   new Float64Array(MEMORY.buffer.slice(cp, cp + C.byteLength))
  // );
  C.set(new Float64Array(MEMORY.buffer.slice(cp, cp + C.byteLength)));
  free(ap);
  // free(bp);
  // free(cp);
}
