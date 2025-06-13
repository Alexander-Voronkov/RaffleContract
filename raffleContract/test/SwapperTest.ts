import { ethers, ignition } from "hardhat";
import SwapperModule from "../ignition/modules/SwapperModule";
import { IERC20, IWETH, Swapper } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import * as constants from '../constants/contractAddresses';
import { bigint } from "hardhat/internal/core/params/argumentTypes";

describe('SwapperTests', async () => {
    async function fundWithUSDT(to: string, amount: bigint) {
        await ethers.provider.send("hardhat_impersonateAccount", [constants.binanceUsdtWhale]);
        const whale = await ethers.getSigner(constants.binanceUsdtWhale);
        const usdt = await ethers.getContractAt("IERC20", constants.usdtAddress);
        await usdt.connect(whale).transfer(to, amount);
        await ethers.provider.send("hardhat_stopImpersonatingAccount", [constants.binanceUsdtWhale]);
    }

    async function deploySwapper() {
        const { swapper, usdt, usdc, bnb, weth } = await ignition.deploy(SwapperModule);
        const [ owner, ...others ] = await ethers.getSigners();

        const typedSwapper = swapper as unknown as Swapper;
        const typedUsdt = usdt as unknown as IERC20;
        const typedUsdc = usdc as unknown as IERC20;
        const typedBnb = bnb as unknown as IERC20;
        const typedWeth = weth as unknown as IWETH;

        return { swapper: typedSwapper, usdt: typedUsdt, usdc: typedUsdc, bnb: typedBnb, weth: typedWeth, owner, others };
    }

    it('swapper is swapping between all supported tokens', async () => {
        const { swapper, usdt, usdc, bnb, weth, owner, others } = await loadFixture(deploySwapper);

        await fundWithUSDT(others[0].address, BigInt(1000000 * 3000));
        const balanceAfterFunding = await usdt.connect(others[0]).balanceOf(others[0]);

        console.log('balance after funding: ', ethers.formatUnits(balanceAfterFunding, 6), 'USDT');

        await usdt.connect(others[0]).approve(swapper, 0);
        await usdt.connect(others[0]).approve(swapper, 1000000 * 2600);
        console.log('ALLOWANCE ', ethers.formatUnits(await usdt.allowance(others[0], swapper), 6));
        
        let receiverBalanceInWeth = await weth.balanceOf(others[1]);
        console.log('receiver balance in wether before swap ', ethers.formatEther(receiverBalanceInWeth));
        
        await swapper.swapTokenForETH(constants.usdtAddress, 1000000 * 2500, others[0], others[1]);

        receiverBalanceInWeth = await weth.balanceOf(others[1]);
        console.log('receiver balance in wether after swap ', ethers.formatEther(receiverBalanceInWeth), 'WETH');

        let receiverBalanceInEth = await ethers.provider.getBalance(others[1]);
        console.log('balance before withdraw: ', ethers.formatEther(receiverBalanceInEth), 'ETH')
        await weth.connect(others[1]).withdraw(receiverBalanceInWeth);

        receiverBalanceInEth = await ethers.provider.getBalance(others[1]);
        console.log('balance after withdraw: ', ethers.formatEther(receiverBalanceInEth), 'ETH')

    });
});