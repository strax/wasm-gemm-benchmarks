#include <stdlib.h>
#include "wasm.h"

WASM_EXPORT("blas_calloc")
void *blas_calloc(size_t num, size_t size)
{
    void *ptr = calloc(num, size);
    return ptr;
}

WASM_EXPORT("blas_free")
void blas_free(void *ptr)
{
    free(ptr);
}