import { ethers, ignition } from "hardhat";
import SwapperModule from "../ignition/modules/SwapperModule";
import { IERC20, IERC20__factory, IWETH, IWETH__factory, Swapper, Swapper__factory } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { AddressLike } from "ethers";
import { binanceWhale, usdtAddress } from "../constants/contractAddresses";

describe('SwapperTests', async () => {
    async function fundWithUSDT(to: AddressLike, amount: bigint, usdt: IERC20) {
        await ethers.provider.send("hardhat_impersonateAccount", [binanceWhale]);
        const whale = await ethers.getSigner(binanceWhale);
        await usdt.connect(whale).transfer(to, amount);
        await ethers.provider.send("hardhat_stopImpersonatingAccount", [binanceWhale]);
    }

    async function deploySwapper() {
        const { swapper, usdt, usdc, weth } = await ignition.deploy(SwapperModule);
        const [ owner, ...others ] = await ethers.getSigners();

        const typedSwapper = Swapper__factory.connect(await swapper.getAddress(), owner);
        const typedUsdt = IERC20__factory.connect(await usdt.getAddress(), owner);
        const typedUsdc = IERC20__factory.connect(await usdc.getAddress(), owner);
        const typedWeth = IWETH__factory.connect(await weth.getAddress(), owner);

        return { swapper: typedSwapper, usdt: typedUsdt, usdc: typedUsdc, weth: typedWeth, owner, others };
    }

    it('swapper is swapping between all supported tokens', async () => {
        const { swapper, usdt, usdc, weth, owner, others } = await loadFixture(deploySwapper);

        await fundWithUSDT(others[0], BigInt(1000000 * 3000), usdt);
        const balanceAfterFunding = await usdt.connect(others[0]).balanceOf(others[0]);

        console.log('balance after funding: ', ethers.formatUnits(balanceAfterFunding, 6), 'USDT');

        await usdt.connect(others[0]).approve(swapper, 0);
        await usdt.connect(others[0]).approve(swapper, 1000000 * 3000);
        console.log('ALLOWANCE ', ethers.formatUnits(await usdt.allowance(others[0], swapper), 6));
        
        let receiverBalanceInWeth = await weth.balanceOf(others[1]);
        console.log('receiver balance in wether before swap ', ethers.formatEther(receiverBalanceInWeth));
        
        await swapper.swapTokenForETH(usdtAddress, 1000000 * 3000, others[0], others[1]);

        receiverBalanceInWeth = await weth.balanceOf(others[1]);
        console.log('receiver balance in wether after swap ', ethers.formatEther(receiverBalanceInWeth), 'WETH');

        let receiverBalanceInEth = await ethers.provider.getBalance(others[1]);
        console.log('balance before withdraw: ', ethers.formatEther(receiverBalanceInEth), 'ETH')
        await weth.connect(others[1]).withdraw(receiverBalanceInWeth);

        receiverBalanceInEth = await ethers.provider.getBalance(others[1]);
        console.log('balance after withdraw: ', ethers.formatEther(receiverBalanceInEth), 'ETH')

    });
});