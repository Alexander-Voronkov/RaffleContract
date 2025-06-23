// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2Mock.sol";

contract VRFMock is VRFCoordinatorV2Mock {
  constructor() VRFCoordinatorV2Mock(1, 1) {}
}
