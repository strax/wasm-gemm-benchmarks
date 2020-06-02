#include "wasm.h"
#include <wasm_simd128.h>
#include <stdint.h>
#include <math.h>

WASM_EXPORT("sasum")
f32_t sasum(i32_t n, f32_t *x, i32_t incx)
{
    if (n <= 0 || incx < 1)
    {
        return 0;
    }
    f32_t asum = 0.0;
#pragma clang loop vectorize(enable)
    for (int i = 0; i < (n * incx); i += incx)
    {
        asum += __builtin_fabsf(x[i]);
    }
    return asum;
}

WASM_EXPORT("dasum")
f64_t dasum(i32_t n, f64_t *x, i32_t incx)
{
    if (n <= 0 || incx < 1)
    {
        return 0;
    }
    f64_t asum = 0.0;
#pragma clang loop vectorize(enable)
    for (int i = 0; i < (n * incx); i += incx)
    {
        asum += __builtin_fabs(x[i]);
    }
    return asum;
}