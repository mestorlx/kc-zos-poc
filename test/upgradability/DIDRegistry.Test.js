/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts, assert, contract, describe, it */
const glob = require("glob")
const fs = require('fs');
const encodeCall = require('zos-lib').encodeCall;
const { execSync } = require('child_process');

const DIDRegistryExtraFunctionality = artifacts.require('DIDRegistryExtraFunctionality')
const MultiSigWallet = artifacts.require('MultiSigWallet')

global.artifacts = artifacts;
global.web3 = web3;


async function assertRevert(promise) {
    try {
        await promise;
        assert.fail('Expected revert not received');
    } catch (error) {
        const revertFound = error.message.search('revert') >= 0;
        assert(revertFound, `Expected "revert", got ${error} instead`);
    }
};

contract('DIDRegistry', (accounts) => {
    let owner = accounts[0];
    let users = [accounts[1], accounts[2]];
    // wallet address to manage upgrades
    let multisig;
    // address we want the proxy contract to point to
    let implementationAddress;
    // proxy to DIDRegistry. Wth zos this will be the equivalent to the contract
    let proxyAddress;

    async function setInstances(contractName) {
        let files = glob.sync("./zos.dev-*.json")
        if (files === undefined || files.length == 0) {
            // array empty or does not exist
            console.log("zos config file not found (zos.dev-*.json)")
        }
        console.log("using json:", files[0])
        const networkInfo = JSON.parse(fs.readFileSync(files[0]));

        const proxiesOfContract = networkInfo.proxies['oceanprotocol/' + contractName];
        if (!proxiesOfContract || proxiesOfContract.length === 0) {
            throw Error(`No deployed proxies of contract ${contractName} found`);
        } else if (proxiesOfContract.length > 1) {
            throw Error(`Multiple proxies of contract ${contractName} found`);
        }

        const implementationOfContract = networkInfo.contracts && networkInfo.contracts[contractName];
        if (!implementationOfContract) {
            throw Error(`No deployed logic contract for ${contractName}, make sure to call 'zos push --network ${networkName}'`);
        }

        proxyAddress = proxiesOfContract[0].address;
        implementationAddress = implementationOfContract.address;
        console.log(`instances set to ${proxyAddress} and ${implementationAddress} `);
    }

    before('Deploy with zos before all tests', async function () {
        await MultiSigWallet.new([owner, users[0], users[1]], 2, { from: owner }).then(i => {
            multisig = i;
        })
        let stdout = execSync('./scripts/deployContractsForTest.sh ' + multisig.address);
        console.log(stdout)
    })

    beforeEach('Return the contract back to the original state', async function () {

    })

    describe('Test upgradability for DIDRegistry', () => {
        it('Should be able to call new method added after upgrade is approved', async () => {
            execSync('npx zos add DIDRegistryExtraFunctionality:DIDRegistry --skip-compile')
            execSync('npx zos push --network development --skip-compile')
            await setInstances('DIDRegistry')
            const upgradeCallData = encodeCall('upgradeTo', ['address'], [implementationAddress]);
            await multisig.submitTransaction(proxyAddress, 0, upgradeCallData, { from: owner });
            p = await DIDRegistryExtraFunctionality.at(proxyAddress);
            //should not be able to be called before upgrade is approved
            await assertRevert(p.getNumber())
            //Approve and call again
            await multisig.confirmTransaction(0, { from: users[0] });
            await p.getNumber().then(i => n = i)
            assert.equal(n.toString(), '42', "Error calling getNumber");
        })

    })
})
