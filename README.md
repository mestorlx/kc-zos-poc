# Keeper-contracts upgradability POC
This repository contains a WIP of a POC to demonstrate how [zeppelinOS](https://github.com/zeppelinos/zos) can be used to manage [keeper-contracts](https://github.com/oceanprotocol/keeper-contracts) upgradability.\
Note:This work is based on [zeppelins documentation](https://docs.zeppelinos.org/docs/start.html). Specially on this [post](https://blog.zeppelinos.org/exploring-upgradeability-governance-in-zeppelinos-with-a-gnosis-multisig/) by [Santiago](https://github.com/spalladino)

## Quickstart

1. Install `npm` dependencies with

   ```bash
    npm install
    ```

2. In a new terminal start gnache with

    ```bash
    npx ganache-cli --port 9545 --deterministic
    ```

3. Test upgradability

    ```bash
    npm test
    ```

## Details

Here we provide more detail into the approach of upgradability and governance.


### Governance

For governance [gnosis multisignature wallet](https://github.com/gnosis/MultiSigWallet) is used. A [setup](./setupAndDeploy.sh) script creates a wallet using four accounts and sets the minimum votes at two for simplicity.

### upgradability

Is managed with `zos` tool. The script after deployment grants admin rights to the wallet rather the account that made the deployment

### Test
For the initial test we deploy a contract `DIDRegistry` that we want to upgrade to `DIDRegistryExtraFunctionality` that adds a new method. After all contracts are deployed the proxy address can be used with

```bash
p=DIDRegistry.at('0xcc5f0a600fd9dc5dd8964581607e5cc0d22c5a78')
p.getOwner(0)
```

or for the upgraded version

```bash
p=DIDRegistryExtraFunctionality.at('0xcc5f0a600fd9dc5dd8964581607e5cc0d22c5a78')
p.getNumber().then(i=>i.valueOf())
```



Before the upgrade is approved the cast will work but calling the function will fail.