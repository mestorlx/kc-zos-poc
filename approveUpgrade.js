const App = require('zos-lib').App;
const Proxy = require('zos-lib').Proxy;
const encodeCall = require('zos-lib').encodeCall;
const fs = require('fs');
const process = require('process');
const MultiSigWallet = artifacts.require('MultiSigWallet')

global.artifacts = artifacts;
global.web3 = web3;

async function approveUpgrade(networkName, multisigAddress, sender) {
    if (!sender) {
        throw Error("Account number of a owner is required");
    }
    const networkInfo = JSON.parse(fs.readFileSync(`zos.${networkName}.json`));

    console.log(`Approving upgrade via wallet ${multisigAddress} from ${sender}`);

    const multisig = await MultiSigWallet.at(multisigAddress);
    await multisig.confirmTransaction(0, { from: sender });

    console.log("Submitted approval to multisig");
}

module.exports = function (cb) {
    const scriptIndex = process.argv.indexOf('approveUpgrade.js');
    const networkIndex = process.argv.indexOf('--network');
    approveUpgrade(process.argv[networkIndex + 1], process.argv[scriptIndex + 1], process.argv[scriptIndex + 2])
        .then(() => cb())
        .catch(err => cb(err));
}