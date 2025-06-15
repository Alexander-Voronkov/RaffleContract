import { expect } from 'chai';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import RaffleModule from '../ignition/modules/RaffleModule';
import { ethers, ignition } from 'hardhat';
import { IERC20, IERC20__factory, IWETH__factory, Raffle, Raffle__factory, Swapper__factory } from '../typechain-types';
import { binanceWhale, usdtAddress } from '../constants/contractAddresses';
import { AddressLike } from 'ethers';

describe('RaffleTests', async () => {

    let interval: number = 1;

    async function fundWithUSDT(to: AddressLike, amount: bigint, usdt: IERC20) {
        await ethers.provider.send("hardhat_impersonateAccount", [binanceWhale]);
        const whale = await ethers.getSigner(binanceWhale);
        await usdt.connect(whale).transfer(to, amount);
        await ethers.provider.send("hardhat_stopImpersonatingAccount", [binanceWhale]);
    }

    async function deployRaffleModule() {
        const { proxy, raffleProxy, proxyAdmin, mock, consumer, swapper, usdc, usdt, weth } 
            = await ignition.deploy(RaffleModule(interval));
        const [owner, ...others] = await ethers.getSigners();

        const typedProxy = Raffle__factory.connect(await raffleProxy.getAddress(), owner);
        const typedSwapper = Swapper__factory.connect(await swapper.getAddress(), owner);
        const typedUsdt = IERC20__factory.connect(await usdt.getAddress(), owner);
        const typedUsdc = IERC20__factory.connect(await usdc.getAddress(), owner);
        const typedWeth = IWETH__factory.connect(await weth.getAddress(), owner);
        
        return { 
            raffleProxy: typedProxy,
            owner, 
            others, 
            vrfMock: mock, 
            vrfConsumer: consumer,
            swapper: typedSwapper,
            usdt: typedUsdt,
            usdc: typedUsdc,
            weth: typedWeth,
        };
    }

    it("should fork mainnet and check binance eth wallet", async () => {
        const network = await ethers.provider.getNetwork();
        console.log('Chain ID:', network.chainId);

        expect(network.chainId).to.eq(1337);

        const balance = await ethers.provider.getBalance("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
        expect(balance).to.be.a('bigint');
    });

    it('should be ownable', async () => {
        interval = 60;

        const { raffleProxy, owner, usdt, usdc } = await loadFixture(deployRaffleModule);

        const raffleOwner = await raffleProxy.owner();

        expect(raffleOwner).to.eq(owner);
    });

    it("should perform upkeep after interval", async function () {
        interval = 60;
        const { raffleProxy, others, usdt } = await loadFixture(deployRaffleModule);

        // await others[0].sendTransaction({
        //     to: raffleProxy,
        //     value: ethers.parseEther('1'),
        // });

        await fundWithUSDT(others[0], BigInt(1000000 * 10000), usdt); // 10k baksov
        await usdt.connect(others[0]).approve(raffleProxy, BigInt(1000000 * 1000)); // allow to spend 1k

        console.log('ALLOWANCE', ethers.formatUnits(await usdt.allowance(others[0], raffleProxy.target), 6));
        console.log('USDT BALANCE', ethers.formatUnits(await usdt.balanceOf(others[0]), 6));

        await raffleProxy.connect(others[0]).deposit(usdtAddress, BigInt(1000000 * 1000));

        expect(await raffleProxy.totalAmountInUsd()).to.be.greaterThan(0);

        let [needed] = await raffleProxy.checkUpkeep("0x");
        expect(needed).to.equal(false);

        await time.increase(interval + 1);

        [needed] = await raffleProxy.checkUpkeep("0x");
        expect(needed).to.equal(true);

        const counter = await raffleProxy.gamesCount();

        await raffleProxy.performUpkeep("0x");

        expect(await raffleProxy.gamesCount()).to.equal(Number(counter) + 1);
    });

    it('should deposit tokens and select winner', async function() {
        interval = 60;
        const { raffleProxy, others, usdt } = await loadFixture(deployRaffleModule);

        const depositAmount = BigInt(1000 * 1_000_000);
        await fundWithUSDT(others[0], depositAmount, usdt);
        await fundWithUSDT(others[1], depositAmount * 2n, usdt);

        await usdt.connect(others[0]).approve(raffleProxy, depositAmount);
        await usdt.connect(others[1]).approve(raffleProxy, depositAmount * 2n);

        console.log('--- before deposit ---');
        console.log('player 0 balance:', ethers.formatUnits(await usdt.balanceOf(others[0]), 6));
        console.log('player 1 balance:', ethers.formatUnits(await usdt.balanceOf(others[1]), 6));
        console.log('contract USDT balance:', ethers.formatUnits(await usdt.balanceOf(await raffleProxy.getAddress()), 6));

        await raffleProxy.connect(others[0]).deposit(usdtAddress, depositAmount);
        await raffleProxy.connect(others[1]).deposit(usdtAddress, depositAmount * 2n);

        console.log('--- after dpeosit ---');
        console.log('player 0 balance:', ethers.formatUnits(await usdt.balanceOf(others[0]), 6));
        console.log('player 1 balance:', ethers.formatUnits(await usdt.balanceOf(others[1]), 6));
        console.log('contract USDT balance:', ethers.formatUnits(await usdt.balanceOf(await raffleProxy.getAddress()), 6));
        console.log('totalAmountInUsd:', (await raffleProxy.totalAmountInUsd()).toString());
        console.log('totalAmountInEth:', (await raffleProxy.totalAmountInEth()).toString());

        const players = await raffleProxy.getPlayers();
        console.log('players:', players);

        await time.increase(interval + 1);

        let [needed] = await raffleProxy.checkUpkeep("0x");
        console.log('upkeep needed (spin needs to be executed):', needed);

        const gamesBefore = await raffleProxy.gamesCount();

        await raffleProxy.addListener('WinnerSelected', (event) => {
            console.log('EVENT WINNER SELECTED: ', event);
        });

        await expect(raffleProxy.performUpkeep("0x")).to.emit(raffleProxy, 'WinnerSelected');

        const gamesAfter = await raffleProxy.gamesCount();
        console.log('games count before:', gamesBefore.toString(), 'after:', gamesAfter.toString());

        const playersAfter = await raffleProxy.getPlayers();
        console.log('players after game:', playersAfter);

        expect(gamesAfter).to.equal(Number(gamesBefore) + 1);
    });
});