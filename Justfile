build-c:
    make -C webmkl-c blas.wasm

bench:
    node --harmony-top-level-await --experimental-wasm-eh --experimental-wasm-simd --harmony-weak-refs bench.mjs

test:
    node --harmony-top-level-await --experimental-wasm-eh --experimental-wasm-simd --harmony-weak-refs test-webmkl-c.mjs