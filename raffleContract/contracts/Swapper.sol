pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Swapper {
    address public pool;
    address public tokenIn;
    address public tokenOut;

    constructor(address _pool, address _tokenIn, address _tokenOut) {
        pool = _pool;
        tokenIn = _tokenIn;
        tokenOut = _tokenOut;
    }

    function swapExactInput(uint256 amountIn) external {
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).approve(pool, amountIn);

        IPool(pool).swap(
            msg.sender,
            true, // zeroForOne (tokenIn -> tokenOut)
            int256(amountIn),
            0, // no price limit
            abi.encode(tokenIn, msg.sender)
        );
    }

    function uniswapV4SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external {
        require(msg.sender == pool, "invalid callback");
        (address tokenIn, address payer) = abi.decode(data, (address, address));
        uint256 amount = amount0Delta > 0 ? uint256(amount0Delta) : uint256(amount1Delta);
        IERC20(tokenIn).transferFrom(payer, msg.sender, amount);
    }
}