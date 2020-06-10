build-c:
    make -C webmkl-c blas.wasm

bench-gemm:
    node --harmony-top-level-await --experimental-wasm-eh --experimental-wasm-simd --harmony-weak-refs --expose-gc bench-gemm.mjs

prof-gemm:
    node --harmony-top-level-await --experimental-wasm-eh --experimental-wasm-simd --harmony-weak-refs --expose-gc --trace-deopt --cpu-prof bench-gemm.mjs

bench-dscal:
    node --harmony-top-level-await --experimental-wasm-eh --experimental-wasm-simd --harmony-weak-refs --expose-gc --trace-deopt bench-dscal.mjs

prof-dscal:
    node --harmony-top-level-await --experimental-wasm-eh --experimental-wasm-simd --harmony-weak-refs --expose-gc --trace-deopt --prof bench-dscal.mjs


test:
    node --harmony-top-level-await --experimental-wasm-eh --experimental-wasm-simd --harmony-weak-refs test-webmkl-c.mjs

memcheck:
    node --harmony-top-level-await --experimental-wasm-eh --experimental-wasm-simd --harmony-weak-refs --expose-gc memcheck.mjs