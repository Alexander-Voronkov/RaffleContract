import { useAppKitAccount } from '@reown/appkit/react';
import { useBalance } from 'wagmi';
import type { Address } from 'viem';
import { Button } from '@mui/material';

export function BalanceDisplay() {
  const { address } = useAppKitAccount();
  const { data, refetch } = useBalance({
    address: address as Address,
  });

  return (
    <div>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Balance:</strong> {data?.value} {data?.symbol}</p>
      <Button onClick={() => refetch()}>Refresh balance</Button>
    </div>
  );
}