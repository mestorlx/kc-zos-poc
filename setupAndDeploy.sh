#! /usr/bin/env bash
# -----------------------------------------------------------------------
# Compile and deploy contracts
# -----------------------------------------------------------------------

echo 'Using zos version:'
npx zos --version
echo 'Using truffle version:'
npx truffle version
./deployContracts.sh
set -e

# -----------------------------------------------------------------------
# Change admin priviliges to multisig
# -----------------------------------------------------------------------
# We now create a multisig wallet and add accounts[0..3] as owners
# Only two votes are required for upgrade
npx truffle exec setupWallet.js
# Get wallet address
w=$(jq -r '.wallet' wallet.json)
# Change admin of contract to the wallet
npx zos set-admin DIDRegistry $w --network development --yes