// Run with npx truffle exec setUpWallet.js
const fs = require('fs');
const MultiSigWallet = artifacts.require('MultiSigWallet')

global.artifacts = artifacts;
global.web3 = web3;

async function setUpWallet() {
    console.log("Setting accounts")
    accounts = await web3.eth.getAccounts()
    o0 = accounts[0]
    o1 = accounts[1]
    o2 = accounts[2]
    o3 = accounts[3]

    await MultiSigWallet.new([o0, o1, o2, o3], 2, { from: o0 }).then(i => {
        multisig = i
    })

    addresses = {
        wallet: multisig.address,
        owners: [o0, o1, o2, o3]
    }

    await fs.writeFileSync('./wallet.json', JSON.stringify(addresses, null, 4), 'utf8', (err) => {
        if (err) {
            console.error("Erro writing file:", err);
            return;
        };
    });
    console.log("Wallet file has been created");

}

module.exports = function (cb) {
    setUpWallet()
        .then(() => cb())
        .catch(err => cb(err));
}