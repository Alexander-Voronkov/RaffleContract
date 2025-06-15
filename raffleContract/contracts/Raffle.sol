pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "./VRFMock.sol";
import "./VRFv2Consumer.sol";
import "./Swapper.sol";
import "./ExchangeFeedFetcher.sol";

contract Raffle is Initializable, OwnableUpgradeable, AutomationCompatibleInterface {

    using SafeERC20 for IERC20;

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
        lastDepositTimestamp = block.timestamp;
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

    uint256 public gamesCount;
    uint256 public lastDepositTimestamp;
    uint256 public interval;

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = (block.timestamp - lastDepositTimestamp) >= interval && players.length > 1;
    }

    function performUpkeep(bytes calldata) external override {
        if ((block.timestamp - lastDepositTimestamp) >= interval && players.length > 1) {
            pickWinner();
        }
    }

    struct Player {
        address depositedTokenAddress;
        uint depositedTokenAmount;
        uint amountDepositedInUsd;
        uint8 decimals;
    }

    uint public totalAmountInUsd;
    uint public totalAmountInEth;
    address[] public players;
    mapping(address => Player) public playersOfCurrentRaffle;
    event PlayerJoined(address player, uint indexed amountDepositedInUsd);

    function deposit(address _tokenAddress, uint _amount) external {

        require(tokensAllowedWithFeed[_tokenAddress] != address(0), "Token is not allowed");
        require(_amount > 0, "You need to deposit something");
        require(playersOfCurrentRaffle[msg.sender].depositedTokenAddress == address(0), 'You already participate');

        (int currency, uint8 decimals) = feedFetcher.getLatestData(tokensAllowedWithFeed[_tokenAddress]);

        require(currency > 0, "Token is not supported or not available at the moment");
        IERC20(_tokenAddress).safeTransferFrom(msg.sender, address(this), _amount);
        IERC20(_tokenAddress).safeIncreaseAllowance(address(swapper), _amount);

        uint amountToWithdraw = swapper.swapTokenForETH(_tokenAddress, _amount, address(this), address(this));
        IWETH(swapper.WETH9()).withdraw(amountToWithdraw);

        totalAmountInEth += amountToWithdraw;

        uint depositedInUsd = uint(currency) * _amount;
        players.push(msg.sender);
        playersOfCurrentRaffle[msg.sender] = Player(_tokenAddress, _amount, depositedInUsd, decimals);
        totalAmountInUsd += depositedInUsd;
        lastDepositTimestamp = block.timestamp;

        emit PlayerJoined(msg.sender, depositedInUsd);
    }

    struct ResultPlayer {
        address playerAddress;
        address depositedTokenAddress;
        uint depositedTokenAmount;
        uint amountDepositedInUsd;
        uint8 decimals;
        uint stake;
    }

    function getPlayers() external view returns (ResultPlayer[] memory) {
        ResultPlayer[] memory result = new ResultPlayer[](players.length);

        for (uint256 index = 0; index < players.length; index++) {
            result[index] = ResultPlayer(
                players[index],
                playersOfCurrentRaffle[players[index]].depositedTokenAddress,
                playersOfCurrentRaffle[players[index]].depositedTokenAmount,
                playersOfCurrentRaffle[players[index]].amountDepositedInUsd,
                playersOfCurrentRaffle[players[index]].decimals,
                playersOfCurrentRaffle[players[index]].amountDepositedInUsd * 100 / totalAmountInUsd
            );
        }

        return result;
    }

    event WinnerSelected(address indexed winner, uint indexed winAmountInUsd, uint indexed winAmountInEth);

    function pickWinner() internal {

        uint randomNumber = getRandomNumber();
        uint winningTicket = randomNumber % totalAmountInUsd;
        uint cumulative = 0;
        address winner;

        for (uint i = 0; i < players.length; i++) {
            cumulative += playersOfCurrentRaffle[players[i]].amountDepositedInUsd;
            if (winningTicket < cumulative) {
                winner = players[i];
                break;
            }
        }

        payable(winner).transfer(totalAmountInEth);

        lastDepositTimestamp = block.timestamp;
        gamesCount++;
        totalAmountInEth = 0;
        totalAmountInUsd = 0;

        for (uint256 index = 0; index < players.length; index++) {
            delete playersOfCurrentRaffle[players[index]];
        }

        delete players;
        
        emit WinnerSelected(winner, totalAmountInUsd, totalAmountInEth);

    }

    function getRandomNumber() internal returns (uint randomNum) {
        vrfConsumer.requestRandomWords();
        vrfMock.fulfillRandomWords(vrfConsumer.s_requestId(), address(vrfConsumer));
        randomNum = vrfConsumer.s_randomWords(0);
    }

    receive() external payable {}
}