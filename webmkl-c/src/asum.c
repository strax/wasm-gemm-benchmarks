#include "wasm.h"
#include <wasm_simd128.h>
#include <stdint.h>
#include <math.h>

WASM_EXPORT("sasum")
float sasum(int n, float *x, int incx)
{
    if (n <= 0 || incx < 1)
    {
        return 0;
    }
    float asum = 0.0;
#pragma clang loop vectorize(enable)
    for (int i = 0; i < (n * incx); i += incx)
    {
        asum += __builtin_fabsf(x[i]);
    }
    return asum;
}

WASM_EXPORT("dasum")
double dasum(int n, double *x, int incx)
{
    if (n <= 0 || incx < 1)
    {
        return 0;
    }
    double asum = 0.0;
#pragma clang loop vectorize(enable)
    for (int i = 0; i < (n * incx); i += incx)
    {
        asum += __builtin_fabs(x[i]);
    }
    return asum;
}