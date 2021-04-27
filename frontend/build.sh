#!/usr/bin/env bash

npm run build
rm -vrf ../backends/public
mv -v ./build ../backends/public