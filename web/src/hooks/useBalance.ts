import { useCallback, useEffect, useState } from "react";
import { useBalance } from "wagmi";
import { bnbAddress, usdcAddress, usdtAddress } from "../constants/tokensAddresses";
import { useAppKitAccount } from "@reown/appkit/react";

type TokenBalance = {
  symbol?: string;
  value?: bigint;
  decimals?: number;
};

export function useAllTokenBalances() {
  const [balances, setBalances] = useState<Map<string, TokenBalance>>(new Map<string, TokenBalance>());
  const [loading, setLoading] = useState(false);
  const { address } = useAppKitAccount();
  
  const usdtData  = getTokenBalance(address as `0x${string}`, usdtAddress);
  const usdcData = getTokenBalance(address as `0x${string}`, usdcAddress);
  const bnbData = getTokenBalance(address as `0x${string}`, bnbAddress);

  const fetchBalances = useCallback(async () => {

    console.log('refetching ...');

    setLoading(true);
    const results: Map<string, TokenBalance> = new Map<string, TokenBalance>();

    results.set(usdtAddress, {
        symbol: usdtData?.symbol,
        value: usdtData?.value,
        decimals: usdtData?.decimals,
    });   

    results.set(usdcAddress, {
        symbol: usdcData?.symbol,
        value: usdcData?.value,
        decimals: usdcData?.decimals,
    });  

    results.set(bnbAddress, {
        symbol: bnbData?.symbol,
        value: bnbData?.value,
        decimals: bnbData?.decimals,
    });  

    setBalances(results);
    setLoading(false);
  }, [address, bnbData, usdtData, usdcData]);

  useEffect(() => {
    if (address) fetchBalances();
  }, [address, fetchBalances]);

  return { balances, loading, refetch: fetchBalances, address };
}

function getTokenBalance(address: `0x${string}`, tokenAddress: `0x${string}`) {
  const { data } = useBalance({
      address: address,
      token: tokenAddress,
  });

  return data;
}