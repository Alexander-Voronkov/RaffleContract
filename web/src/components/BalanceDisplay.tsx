import { useAppKitAccount } from '@reown/appkit/react';
import { useBalance } from 'wagmi';
import type { Address } from 'viem';
import { Button } from '@mui/material';
import { bnbAddress, usdcAddress, usdtAddress } from '../constants/tokensAddresses';
import { useCallback } from 'react';

export function BalanceDisplay() {
  const { address } = useAppKitAccount();
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({ address: address as Address });
  const { data: usdtBalance, refetch: refetchUsdtBalance } = useBalance({ address: address as Address, token: usdtAddress});
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useBalance({ address: address as Address, token: usdcAddress});
  const { data: bnbBalance, refetch: refetchBnbBalance } = useBalance({ address: address as Address, token: bnbAddress});

  const refetchAllBalances = useCallback(() => {
    return Promise.all([refetchEthBalance(),
    refetchUsdtBalance(),
    refetchUsdcBalance(),
    refetchBnbBalance()]);
  }, [ethBalance, usdtBalance, usdcBalance, bnbBalance]);

  return (
    <div>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Balance in eth:</strong> {(ethBalance?.value ?? BigInt(0)) / BigInt(10 ** (ethBalance?.decimals ?? 1))} {ethBalance?.symbol}</p>
      <p><strong>Balance in usdt:</strong> {(usdtBalance?.value ?? BigInt(0)) / BigInt(10 ** (usdtBalance?.decimals ?? 1))} {usdtBalance?.symbol}</p>
      <p><strong>Balance in usdc:</strong> {(usdcBalance?.value ?? BigInt(0)) / BigInt(10 ** (usdcBalance?.decimals ?? 1))} {usdcBalance?.symbol}</p>
      <p><strong>Balance in bnb:</strong> {(bnbBalance?.value ?? BigInt(0)) / BigInt(10 ** (bnbBalance?.decimals ?? 1))} {bnbBalance?.symbol}</p>
      <Button onClick={refetchAllBalances}>Refresh balance</Button>
    </div>
  );
}