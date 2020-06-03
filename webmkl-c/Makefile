CC = "clang-11"
CFLAGS = \
	-Wall \
	--target=wasm32-wasi \
	-Ofast \
	-flto \
	-nostdlib \
	-lc \
	--sysroot=sysroot \
	-fvisibility=hidden \
	-ffunction-sections \
	-fdata-sections \
	-Wl,--no-entry,--no-gc-sections,--export=__heap_base,--export=__data_end \
	-msimd128 \
	-mbulk-memory \
	-Isrc \
	-v

blas.wasm: src/scal.c src/asum.c src/gemm.c src/malloc.c
	$(CC) $(CFLAGS) $^ -o $@
	# wasm-opt -O3 blas.wasm -o blas.wasm