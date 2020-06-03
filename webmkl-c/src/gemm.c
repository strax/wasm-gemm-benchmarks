#include "wasm.h"
#include <stdint.h>
#include <float.h>
#include <wasm_simd128.h>

#define A(i, j) A[(j)*lda + (i)]
#define B(i, j) B[(j)*ldb + (i)]
#define C(i, j) C[(j)*ldc + (i)]

void gemm_adddot(int k, double *x, int incx, double *y, double *gamma);

void gemm_adddot1x4(int k, double *A, int lda, double *B, int ldb, double *C, int ldc)
{
    int p;

    register double c$00, c$01, c$02, c$03, a$00;
    c$00 = 0.0;
    c$01 = 0.0;
    c$02 = 0.0;
    c$03 = 0.0;

    double *bp0, *bp1, *bp2, *bp3;
    bp0 = &B(0, 0);
    bp1 = &B(0, 1);
    bp2 = &B(0, 2);
    bp3 = &B(0, 3);

    // gemm_adddot(k, &A(0, 0), lda, &B(0, 0), &C(0, 0));
    // gemm_adddot(k, &A(0, 0), lda, &B(0, 1), &C(0, 1));
    // gemm_adddot(k, &A(0, 0), lda, &B(0, 2), &C(0, 2));
    // gemm_adddot(k, &A(0, 0), lda, &B(0, 3), &C(0, 3));
    for (p = 0; p < k; p += 4)
    {
        a$00 = A(0, p);
        c$00 += a$00 * *(bp0);
        c$01 += a$00 * *(bp1);
        c$02 += a$00 * *(bp2);
        c$03 += a$00 * *(bp3);

        a$00 = A(0, p + 1);
        c$00 += a$00 * *(bp0 + 1);
        c$01 += a$00 * *(bp1 + 1);
        c$02 += a$00 * *(bp2 + 1);
        c$03 += a$00 * *(bp3 + 1);

        a$00 = A(0, p + 2);
        c$00 += a$00 * *(bp0 + 2);
        c$01 += a$00 * *(bp1 + 2);
        c$02 += a$00 * *(bp2 + 2);
        c$03 += a$00 * *(bp3 + 2);

        a$00 = A(0, p + 3);
        c$00 += a$00 * *(bp0 + 3);
        c$01 += a$00 * *(bp1 + 3);
        c$02 += a$00 * *(bp2 + 3);
        c$03 += a$00 * *(bp3 + 3);

        bp0 += 4;
        bp1 += 4;
        bp2 += 4;
        bp3 += 4;
    }

    C(0, 0) += c$00;
    C(0, 1) += c$01;
    C(0, 2) += c$02;
    C(0, 3) += c$03;
}

void gemm_adddot4x4(const int k, const double *A, const int lda, const double *B, const int ldb, double *C, const int ldc)
{
    int p;

    double *bp0 = &B(0, 0), *bp1 = &B(0, 1), *bp2 = &B(0, 2), *bp3 = &B(0, 3);

    v128_t simd_c00_c10, simd_c01_c11, simd_c02_c12, simd_c03_c13, simd_c20_c30, simd_c21_c31, simd_c22_c32, simd_c23_c33;
    v128_t simd_bp0, simd_bp1, simd_bp2, simd_bp3, simd_a0p_a1p, simd_a2p_a3p;

    simd_c00_c10 = wasm_f64x2_const(0.0, 0.0);
    simd_c01_c11 = wasm_f64x2_const(0.0, 0.0);
    simd_c02_c12 = wasm_f64x2_const(0.0, 0.0);
    simd_c03_c13 = wasm_f64x2_const(0.0, 0.0);
    simd_c20_c30 = wasm_f64x2_const(0.0, 0.0);
    simd_c21_c31 = wasm_f64x2_const(0.0, 0.0);
    simd_c22_c32 = wasm_f64x2_const(0.0, 0.0);
    simd_c23_c33 = wasm_f64x2_const(0.0, 0.0);

    for (p = 0; p < k; p++)
    {
        // Cache register variables a_0..a_4
        // a_0 = A(0, p);
        // a_1 = A(1, p);
        // a_2 = A(2, p);
        // a_3 = A(3, p);
        simd_a0p_a1p = wasm_v128_load(&A(0, p));
        simd_a2p_a3p = wasm_v128_load(&A(2, p));

        simd_bp0 = wasm_f64x2_splat(*(bp0++));
        simd_bp1 = wasm_f64x2_splat(*(bp1++));
        simd_bp2 = wasm_f64x2_splat(*(bp2++));
        simd_bp3 = wasm_f64x2_splat(*(bp3++));

        // Row 1 & 2
        // c_00 += a_0 * b_0;
        // c_10 += a_1 * b_0;
        // c_01 += a_0 * b_1;
        // c_11 += a_1 * b_1;
        // c_02 += a_0 * b_2;
        // c_12 += a_1 * b_2;
        // c_03 += a_0 * b_3;
        // c_13 += a_1 * b_3;
        simd_c00_c10 = wasm_f64x2_add(simd_c00_c10, wasm_f64x2_mul(simd_a0p_a1p, simd_bp0));
        simd_c01_c11 = wasm_f64x2_add(simd_c01_c11, wasm_f64x2_mul(simd_a0p_a1p, simd_bp1));
        simd_c02_c12 = wasm_f64x2_add(simd_c02_c12, wasm_f64x2_mul(simd_a0p_a1p, simd_bp2));
        simd_c03_c13 = wasm_f64x2_add(simd_c03_c13, wasm_f64x2_mul(simd_a0p_a1p, simd_bp3));

        // Row 3 & 4
        // c_20 += a_2 * b_0;
        // c_30 += a_3 * b_0;
        // c_21 += a_2 * b_1;
        // c_31 += a_3 * b_1;
        // c_22 += a_2 * b_2;
        // c_32 += a_3 * b_2;
        // c_23 += a_2 * b_3;
        // c_33 += a_3 * b_3;
        simd_c20_c30 = wasm_f64x2_add(simd_c20_c30, wasm_f64x2_mul(simd_a2p_a3p, simd_bp0));
        simd_c21_c31 = wasm_f64x2_add(simd_c21_c31, wasm_f64x2_mul(simd_a2p_a3p, simd_bp1));
        simd_c22_c32 = wasm_f64x2_add(simd_c22_c32, wasm_f64x2_mul(simd_a2p_a3p, simd_bp2));
        simd_c23_c33 = wasm_f64x2_add(simd_c23_c33, wasm_f64x2_mul(simd_a2p_a3p, simd_bp3));
    }

    C(0, 0) += wasm_f64x2_extract_lane(simd_c00_c10, 0);
    C(0, 1) += wasm_f64x2_extract_lane(simd_c01_c11, 0);
    C(0, 2) += wasm_f64x2_extract_lane(simd_c02_c12, 0);
    C(0, 3) += wasm_f64x2_extract_lane(simd_c03_c13, 0);

    C(1, 0) += wasm_f64x2_extract_lane(simd_c00_c10, 1);
    C(1, 1) += wasm_f64x2_extract_lane(simd_c01_c11, 1);
    C(1, 2) += wasm_f64x2_extract_lane(simd_c02_c12, 1);
    C(1, 3) += wasm_f64x2_extract_lane(simd_c03_c13, 1);

    C(2, 0) += wasm_f64x2_extract_lane(simd_c20_c30, 0);
    C(2, 1) += wasm_f64x2_extract_lane(simd_c21_c31, 0);
    C(2, 2) += wasm_f64x2_extract_lane(simd_c22_c32, 0);
    C(2, 3) += wasm_f64x2_extract_lane(simd_c23_c33, 0);

    C(3, 0) += wasm_f64x2_extract_lane(simd_c20_c30, 1);
    C(3, 1) += wasm_f64x2_extract_lane(simd_c21_c31, 1);
    C(3, 2) += wasm_f64x2_extract_lane(simd_c22_c32, 1);
    C(3, 3) += wasm_f64x2_extract_lane(simd_c23_c33, 1);
}

void gemm_adddot(int k, double *x, int incx, double *y, double *gamma)
{
    int p;
    for (p = 0; p < k; p++)
    {
        *gamma += x[p * incx] * y[p];
    }
}

// WASM_EXPORT("dgemm")
// void dgemm(const int m, const int n, const int k, const double *A, const int lda, const double *B, const int ldb, double *C, const int ldc)
// {
//     __builtin_assume(m >= 0);
//     __builtin_assume(n >= 0);
//     __builtin_assume(k >= 0);

//     if (m == 0 || n == 0 || k == 0)
//     {
//         return;
//     }

//     int i, j;
//     for (j = 0; j < n; j += 4)
//     {
//         for (i = 0; i < m; i += 4)
//         {
//             // gemm_adddot1x4(k, &A(i, 0), lda, &B(0, j), ldb, &C(i, j), ldc);
//             gemm_adddot4x4(k, &A(i, 0), lda, &B(0, j), ldb, &C(i, j), ldc);
//         }
//     }
// }

WASM_EXPORT("dgemm")
void dgemm(const int m, const int n, const int k, const double *A, const int lda, const double *B, const int ldb, double *C, const int ldc)
{
    __builtin_assume(m >= 0);
    __builtin_assume(n >= 0);
    __builtin_assume(k >= 0);

    if (m == 0 || n == 0 || k == 0)
    {
        return;
    }

    int i, j, p;

    for (i = 0; i < m; i++)
    {
        for (j = 0; j < n; j++)
        {
            for (p = 0; p < k; p++)
            {
                C(i, j) = C(i, j) + A(i, p) * B(p, j);
            }
        }
    }
}
