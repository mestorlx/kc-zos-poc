const App = require('zos-lib').App;
const Proxy = require('zos-lib').Proxy;
const encodeCall = require('zos-lib').encodeCall;
const fs = require('fs');
const process = require('process');
const MultiSigWallet = artifacts.require('MultiSigWallet')

global.artifacts = artifacts;
global.web3 = web3;

async function submitUpgrade(networkName, contractName, multisigAddress, sender) {
  if (!contractName) {
    throw Error("Contract name of the proxy to change ownership of is required");
  }
  if (!sender) {
    throw Error("Account number of a owner is required");
  }
  const networkInfo = JSON.parse(fs.readFileSync(`zos.${networkName}.json`));

  const proxiesOfContract = networkInfo.proxies[contractName];
  if (!proxiesOfContract || proxiesOfContract.length === 0) {
    throw Error(`No deployed proxies of contract ${contractName} found`);
  } else if (proxiesOfContract.length > 1) {
    throw Error(`Multiple proxies of contract ${contractName} found`);
  }

  const implementationOfContract = networkInfo.contracts && networkInfo.contracts[contractName];
  if (!implementationOfContract) {
    throw Error(`No deployed logic contract for ${contractName}, make sure to call 'zos push --network ${networkName}'`);
  }

  const proxyAddress = proxiesOfContract[0].address;
  const implementationAddress = implementationOfContract.address;
  console.log(`Requesting instance upgrade of ${proxyAddress} of ${contractName} to ${implementationAddress} from owner ${sender} via wallet ${multisigAddress}`);

  const multisig = MultiSigWallet.at(multisigAddress);
  const upgradeCallData = encodeCall('upgradeTo', ['address'], [implementationAddress]);
  await multisig.submitTransaction(proxyAddress, 0, upgradeCallData, { from: sender });

  console.log("Submitted upgrade transaction to multisig");
}

module.exports = function (cb) {
  const scriptIndex = process.argv.indexOf('submitUpgrade.js');
  const networkIndex = process.argv.indexOf('--network');
  submitUpgrade(process.argv[networkIndex + 1], process.argv[scriptIndex + 1], process.argv[scriptIndex + 2], process.argv[scriptIndex + 3])
    .then(() => cb())
    .catch(err => cb(err));
}