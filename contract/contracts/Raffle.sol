pragma solidity 0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Raffle is Initializable, OwnableUpgradeable {

    

    function initialize() public initializer {
        __Ownable_init(msg.sender);


    }
}