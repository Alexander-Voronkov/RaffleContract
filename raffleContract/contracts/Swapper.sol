// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

interface IWETH is IERC20 {
  function withdraw(uint256 wad) external;
}

contract Swapper {
  ISwapRouter public immutable swapRouter;

  address public constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

  uint24 public constant poolFee = 3000;

  constructor(ISwapRouter _swapRouter) {
    swapRouter = _swapRouter;
  }

  function swapTokenForETH(
    address tokenAddress,
    uint256 amountIn,
    address sender,
    address receiver
  ) external returns (uint256 amountOut) {
    TransferHelper.safeApprove(tokenAddress, address(swapRouter), amountIn);
    TransferHelper.safeTransferFrom(tokenAddress, sender, address(this), amountIn);
    uint256 minOut = 0;
    uint160 priceLimit = 0;
    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
      tokenIn: tokenAddress,
      tokenOut: WETH9,
      fee: poolFee,
      recipient: receiver,
      deadline: block.timestamp,
      amountIn: amountIn,
      amountOutMinimum: minOut,
      sqrtPriceLimitX96: priceLimit
    });
    amountOut = swapRouter.exactInputSingle(params);
    return amountOut;
  }
}
