#!/bin/bash

ENTRY="$1" ts-node --transpileOnly config/esbuild.config.ts
