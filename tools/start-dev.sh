#!/bin/bash
webpack serve --config config/webpack.config.ts --env entry="$1" --env mode="development" ${@:2}
