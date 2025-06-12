import { expect } from 'chai';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import RaffleModule from '../ignition/modules/RaffleModule';
import { ethers, ignition } from 'hardhat';
import VRFModule from '../ignition/modules/VRFModule';
import { Raffle } from '../typechain-types';

describe('RaffleTests', async () => {

    let interval: number = 30;

    async function deployRaffleModule() {
        const { proxy, raffleProxy, proxyAdmin } = await ignition.deploy(RaffleModule(interval));
        const { mock, consumer } = await ignition.deploy(VRFModule);
        const [owner, ...others] = await ethers.getSigners();

        const typedProxy = raffleProxy as unknown as Raffle;
        
        return { 
            raffleProxy: typedProxy,
            owner, 
            others, 
            vrfMock: mock, 
            vrfConsumer: consumer 
        };
    }

    it("should fork mainnet and check binance eth wallet", async () => {
        const network = await ethers.provider.getNetwork();
        console.log('Chain ID:', network.chainId);

        expect(network.chainId).to.eq(1);

        const balance = await ethers.provider.getBalance("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
        expect(balance).to.be.a('bigint');
    });

    it("should perform upkeep after interval", async function () {
        interval = 60;
        const { raffleProxy } = await loadFixture(deployRaffleModule);

        let [needed] = await raffleProxy.checkUpkeep("0x");
        expect(needed).to.equal(false);

        // Продвигаем время
        await time.increase(interval + 1);

        // Теперь upkeep нужен
        [needed] = await raffleProxy.checkUpkeep("0x");
        expect(needed).to.equal(true);

        // Выполняем upkeep
        await raffleProxy.performUpkeep("0x");

        expect(await raffleProxy.counter()).to.equal(1);
    });
});