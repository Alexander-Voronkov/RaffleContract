import { useCallback, useEffect, useMemo, useState } from "react";
import { useBalance } from "wagmi";
import { usdcAddress, usdtAddress } from "../constants/tokensAddresses";
import { useAppKitAccount } from "@reown/appkit/react";

type TokenBalance = {
  symbol?: string;
  value?: bigint;
  decimals?: number;
};

export function useAllTokenBalances() {
  const [loading, setLoading] = useState(false);
  const { address } = useAppKitAccount();
  
  const usdtData  = getTokenBalance(address as `0x${string}`, usdtAddress);
  const usdcData = getTokenBalance(address as `0x${string}`, usdcAddress);

  const balances = useMemo(() => {
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

    setLoading(false);

    return results;
  }, [address, usdtData, usdcData]);

  return { balances, loading, address };
}

function getTokenBalance(address: `0x${string}`, tokenAddress: `0x${string}`) {
  const { data } = useBalance({
      address: address,
      token: tokenAddress,
  });

  return data;
}