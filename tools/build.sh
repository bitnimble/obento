#!/bin/bash
webpack --config config/webpack.config.ts --env entry="$1" ${@:2}
