pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import "./VRFMock.sol";
import "./VRFv2Consumer.sol";
import "./Swapper.sol";
import "./ExchangeFeedFetcher.sol";

contract Raffle is Initializable, OwnableUpgradeable, AutomationCompatibleInterface {

    Swapper swapper;
    VRFMock vrfMock;
    VRFv2Consumer vrfConsumer;
    ExchangeFeedFetcher feedFetcher;

    function initialize(
        uint256 _interval, 
        address[] memory _tokens,
        address[] memory _feed,
        Swapper _swapper,
        VRFMock _vrfMock,
        VRFv2Consumer _vrfConsumer,
        ExchangeFeedFetcher _feedFetcher) public initializer {

        require(_feed.length == _feed.length);

        __Ownable_init(msg.sender);
        
        swapper = _swapper;
        vrfMock = _vrfMock;
        vrfConsumer = _vrfConsumer;
        feedFetcher = _feedFetcher;

        interval = _interval;
        lastTimeStamp = block.timestamp;
        for (uint256 index = 0; index < _tokens.length; index++) {
            tokensAllowedWithFeed[_tokens[index]] = _feed[index];
        }
    }    

    mapping(address => address) public tokensAllowedWithFeed;

    function addAllowedToken(
        address tokenAddress, 
        address feedAddress) external onlyOwner {

        tokensAllowedWithFeed[tokenAddress] = feedAddress;
    }

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

    struct Player {
        address depositedTokenAddress;
        uint depositedTokenAmount;
        uint amountDepositedInUsd;
        uint8 decimals;
    }

    mapping(address => Player) public playersOfCurrentRaffle;

    function deposit(address _tokenAddress, uint _amount) external {

        (int answer, uint8 decimals) = feedFetcher.getLatestData(_tokenAddress);

        playersOfCurrentRaffle[msg.sender] = Player(_tokenAddress, _amount, uint(answer), decimals);
    }

    function receive() external payable {}
}