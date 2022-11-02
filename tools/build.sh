#!/bin/bash
NODE_ENV=production webpack --config config/webpack.config.ts --env entry="$1" ${@:2}
