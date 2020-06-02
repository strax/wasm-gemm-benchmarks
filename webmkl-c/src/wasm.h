#ifndef __WASM_H__
#define __WASM_H__

#include <stdint.h>

#define WASM_EXPORT(name) __attribute__((visibility("default"))) __attribute__((export_name(name))) extern
#define WASM_IMPORT extern "C"

typedef int32_t i32_t;
typedef int64_t i64_t;
typedef float f32_t;
typedef double f64_t;

#endif