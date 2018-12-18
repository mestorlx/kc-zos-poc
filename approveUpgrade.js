const fs = require('fs');
const process = require('process');
const MultiSigWallet = artifacts.require('MultiSigWallet')
const glob = require("glob")

global.artifacts = artifacts;
global.web3 = web3;

async function approveUpgrade(networkName, multisigAddress, sender) {
    if (!sender) {
        throw Error("Account number of a owner is required");
    }
    // search for zeppelin config file
    let files = glob.sync("./zos.dev-*.json")
    if (files === undefined || files.length == 0) {
        // array empty or does not exist
        console.log("zos config file not found (zos.dev-*.json)")
    }
    const networkInfo = JSON.parse(fs.readFileSync(files[0]));

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