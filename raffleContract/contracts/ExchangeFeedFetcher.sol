// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract ExchangeFeedFetcher {
    constructor() {
    }

    function getLatestData(address tokenFeedAddress) public view returns (int256 answer, uint8 decimals) {
        AggregatorV3Interface tempAggregator = AggregatorV3Interface(tokenFeedAddress);
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = tempAggregator.latestRoundData();

        uint8 decimals = tempAggregator.decimals();

        return (answer, decimals);
    }
}