pragma solidity 0.4.24;

// Contain upgraded version of the contracts for test
import "../DIDRegistry.sol";

// Upgrade contract with extra functionality
contract DIDRegistryExtraFunctionality is DIDRegistry {
    //returns a number
    function getNumber() public view returns(uint) {
        return 42;
    }

}
