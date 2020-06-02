CC = "clang-11"
CFLAGS = \
	-Wall \
	--target=wasm32 \
	-Ofast \
	-flto \
	-nostdlib \
	-fvisibility=hidden \
	-ffunction-sections \
	-fdata-sections \
	-Xlinker --no-entry \
	-msimd128 \
	-mbulk-memory \
	-Isrc \
	-I/usr/include \
	-v

blas.wasm: src/scal.c src/asum.c src/allocator.c src/dlmalloc.c src/gemm.c
	$(CC) $(CFLAGS) $^ -o $@
	wasm-opt -O3 blas.wasm -o blas.wasm