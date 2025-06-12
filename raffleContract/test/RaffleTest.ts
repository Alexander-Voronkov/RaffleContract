import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import RaffleModule from '../ignition/modules/RaffleModule';
import { ethers, ignition, network } from 'hardhat';

describe('RaffleTests', async () => {

    async function deployRaffleModule() {
        const { proxy, raffleProxy, proxyAdmin } = await ignition.deploy(RaffleModule);
        const [owner, ...others] = await ethers.getSigners();
        
        return { proxy, raffleProxy, proxyAdmin, owner, others };
    }

    it("should fork mainnet and check binance eth wallet", async () => {
        const network = await ethers.provider.getNetwork();
        console.log('Chain ID:', network.chainId);
        const balance = await ethers.provider.getBalance("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
        expect(balance).to.be.a('bigint');
    });

    it('should get a random number for raffle spin', async () => {
        
        const { proxy, raffleProxy, proxyAdmin } = await loadFixture(deployRaffleModule);
    });
});