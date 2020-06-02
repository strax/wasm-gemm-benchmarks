#include "wasm.h"
#include "dlmalloc.h"

WASM_EXPORT("calloc")
i32_t __calloc(i32_t n, i32_t size)
{
    // NOTE(2020-05-22): For some reason, a direct `calloc` will cause "memory access out of bounds" or even segfault on node 14.3.0
    void *ptr = malloc(n * size);
    memset(ptr, 0, n * size);
    return ptr;
}

WASM_EXPORT("free")
void __free(void *ptr)
{
    free(ptr);
}

#define WASM_PAGE_SIZE 1024 * 64

void *sbrk(intptr_t increment)
{
    i32_t result = __builtin_wasm_memory_grow(0, increment / WASM_PAGE_SIZE);
    if (result < 0)
    {
        return -1;
    }
    else
    {
        return result * WASM_PAGE_SIZE;
    }
}