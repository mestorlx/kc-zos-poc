#! /usr/bin/env bash
echo 'Using zos version:'
npx zos --version
echo 'Using truffle version:'
npx truffle version
# -----------------------------------------------------------------------
# Script configuration parameters for truffle test
# -----------------------------------------------------------------------
set -e
set -x
NETWORK='development'
# Since we are running deterministic flag accounts[0] should be here
OWNER='0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
MULTISIG=$1
# Deploy contracts
. ./scripts/deployContracts.sh