import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { bnbAddress, uniswapRouterAddress, usdcAddress, usdtAddress, wethAddress } from "../../constants/contractAddresses";

const SwapperModule = buildModule("SwapperModule", (m) => {

    const swapper = m.contract('Swapper', [uniswapRouterAddress]);
    const usdt = m.contractAt('IERC20', usdtAddress, { id: 'USDT' });
    const usdc = m.contractAt('IERC20', usdcAddress, { id: 'USDC' });
    const bnb = m.contractAt('IERC20', bnbAddress, { id: 'BNB' });
    const weth = m.contractAt('IWETH', wethAddress, { id: 'WETH' });

    return { swapper, usdt, usdc, bnb, weth };
});

export default SwapperModule;