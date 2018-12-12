#! /usr/bin/env bash
# -----------------------------------------------------------------------
# Sample walktrough upgradability test
# -----------------------------------------------------------------------
set -e
# We first add a new contract. We specify which contract should update
npx zos add DIDRegistryExtraFunctionality:DIDRegistry
npx zos push --skip-compile --network development
# At this point we can cast the proxy into DIDRegistryExtraFunctionality but a call to getNumber() will fail

# Now we submitt the upgrade from one of the owners.
w=$(jq -r '.wallet' wallet.json)
o=$(jq -r '.owners[0]' wallet.json)
npx truffle exec submitUpgrade.js DIDRegistry $w $o --network development

p=$(jq -r ".proxies.DIDRegistry[].address" zos.development.json)
echo "Upgrade was submited but it is pending until approved"
echo "You can test the code in truffle by using:"
echo "p=DIDRegistryExtraFunctionality.at('$p')"
echo "p.getNumber().then(i=>i.valueOf())"
echo "NOTE: This method will fail until upgrade is approved"
echo "Press enter to continue and approve"
read
echo "Approving..."

u=$(jq -r '.owners[1]' wallet.json)
npx truffle exec approveUpgrade.js $w $u --network development

echo "Done!"
echo "You can test the code in truffle by using:"
echo "p=DIDRegistryExtraFunctionality.at('$p')"
echo "p.getNumber().then(i=>i.valueOf())"
echo "NOTE: This method will now work!"
