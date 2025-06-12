pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

contract Raffle is Initializable, OwnableUpgradeable, AutomationCompatibleInterface {

    uint256 public counter;
    uint256 public lastTimeStamp;
    uint256 public interval;

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = (block.timestamp - lastTimeStamp) >= interval;
    }

    function performUpkeep(bytes calldata) external override {
        if ((block.timestamp - lastTimeStamp) > interval) {
            lastTimeStamp = block.timestamp;
            counter++;
        }
    }

    function initialize(uint256 _interval) public initializer {
        __Ownable_init(msg.sender);
        
        interval = _interval;
        lastTimeStamp = block.timestamp;
    }
}