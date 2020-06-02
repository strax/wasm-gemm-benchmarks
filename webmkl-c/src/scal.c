#include "wasm.h"
#include <stdint.h>
#include <wasm_simd128.h>

WASM_EXPORT("sscal")
void sscal(int n, float a, float *x)
{
    if (n <= 0)
    {
        return;
    }
    int m = n % 4;
    if (m != 0)
    {
        for (int i = 0; i < m; i++)
        {
            x[i] += a;
        }
        if (n < 4)
        {
            return;
        }
    }
    for (int i = m; i < n; i += 4)
    {
        v128_t v = wasm_v128_load(x + i);
        v128_t u = wasm_f32x4_splat(a);
        wasm_v128_store(x + i, wasm_f32x4_add(v, u));
    }
}

WASM_EXPORT("dscal")
void dscal(int n, double a, double *x)
{
    if (n <= 0)
    {
        return;
    }
    int m = n % 2;
    // Handle odd lengths, even lengths can be vectorised
    // m can only be 0 or 1 so we do not need a loop here
    if (m != 0)
    {
        x[0] += a;
        if (n < 2)
        {
            return;
        }
    }
    for (int i = m; i < n; i += 2)
    {
        v128_t v = wasm_v128_load(x + i);
        v128_t u = wasm_f64x2_splat(a);
        wasm_v128_store(x + i, wasm_f64x2_add(v, u));
    }
}