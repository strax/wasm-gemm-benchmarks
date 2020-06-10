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
    int m = n % 4;
    // Handle odd lengths, even lengths can be vectorised
    // m can only be 0 or 1 so we do not need a loop here
    if (m != 0)
    {
        x[0] += a;
        x[1] += a;
        x[2] += a;
        x += m;
        if (n < 4)
        {
            return;
        }
    }
    for (int i = m; i < n; i += 4)
    {
        *(x) += a;
        *(x + 1) += a;
        *(x + 2) += a;
        *(x + 3) += a;
        x += 4;
    }
}