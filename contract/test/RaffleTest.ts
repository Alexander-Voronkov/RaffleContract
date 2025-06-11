import { expect } from 'chai';
import { ignition, viem } from 'hardhat';
import RaffleModule from '../ignition/modules/RaffleModule';

describe('RaffleTests', async () => {
    let raffleProxyAddress: string;

    beforeEach(async () => {
        const { proxy, raffleProxy, proxyAdmin } = await ignition.deploy(RaffleModule);
        raffleProxyAddress = raffleProxy.address;
    });

    it("should have an owner", async () => {
        // Получаем viem client
        const client = await viem.getPublicClient();
        
        const chainId = await client.getChainId();
        console.log("Chain ID:", chainId); 
        const balance = await client.getBalance({ address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" });
        console.log("Balance:", balance.toString());

        // Читаем owner через viem
        const owner: string = await client.readContract({
            address: raffleProxyAddress as `0x${string}`,
            abi: [
                {
                    "inputs": [],
                    "name": "owner",
                    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
                    "stateMutability": "view",
                    "type": "function"
                }
            ],
            functionName: "owner",
        });

        expect(owner).to.be.a("string");
    });
});