import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, ignition, network } from 'hardhat';
import ExchangeFeedFetcherModule from '../ignition/modules/ExchangeFeedFetcherModule';
import { ExchangeFeedFetcher } from '../typechain-types';
import * as feeds from '../constants/contractAddresses';

describe('ExchangeFeedTests', async () => {
    async function deployExchangeFeedModule() {
        const { fetcher } = await ignition.deploy(ExchangeFeedFetcherModule);
        const [owner, ...others] = await ethers.getSigners();
        
        const typedFetcher = fetcher as unknown as ExchangeFeedFetcher;

        return { fetcher: typedFetcher, owner, others };
    }

    it('should fetch current prices', async function() {

        const { fetcher, owner, others } = await loadFixture(deployExchangeFeedModule);
        
        const [currency1, decimals1] = await fetcher.connect(owner).getLatestData(feeds.eth_usd_feed);
        const [currency2, decimals2] = await fetcher.connect(owner).getLatestData(feeds.bnb_usd_feed);
        const [currency3, decimals3] = await fetcher.connect(owner).getLatestData(feeds.usdc_usd_feed);
        const [currency4, decimals4] = await fetcher.connect(owner).getLatestData(feeds.usdt_usd_feed);
 
        console.log('ETH TO USD: ', Number(currency1) ** Number(decimals1));
        console.log('BNB TO USD: ', Number(currency2) ** Number(decimals2));
        console.log('USDC TO USD: ', Number(currency3) ** Number(decimals3));
        console.log('USDT TO USD: ', Number(currency4) ** Number(decimals4));

        expect(currency1).to.be.a('bigint');
        expect(currency2).to.be.a('bigint');
        expect(currency3).to.be.a('bigint');
        expect(currency4).to.be.a('bigint');
    });
});