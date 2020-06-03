# syntax=docker/dockerfile:experimental

FROM debian AS wasi-sdk

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends build-essential git

ENV PATH="/opt/wasi-sdk/bin:${PATH}"
ADD https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-10/wasi-sdk-10.0-linux.tar.gz /wasi-sdk-10.0-linux.tar.gz
RUN tar -xzf /wasi-sdk-10.0-linux.tar.gz && rm -f /wasi-sdk-10.0-linux.tar.gz && mv /wasi-sdk-10.0 /opt/wasi-sdk

FROM wasi-sdk

COPY . /build