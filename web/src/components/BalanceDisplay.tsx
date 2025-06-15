import { Button } from '@mui/material';
import { useAllTokenBalances } from '../hooks/useBalance';
import { formatBalance } from '../helpers/balanceHelpers';
import { useBalance } from 'wagmi';
import { allowedTokens } from '../constants/tokensAddresses';

export function BalanceDisplay() {
  
  const { balances, refetch, address } = useAllTokenBalances();
  const { data: ethBalance } = useBalance({ address: address as `0x${string}` });

  return (
    <div>
      <p><strong>Address:</strong> {address}</p>
      <p>Balances: </p>
      <p><strong>{formatBalance(ethBalance?.value, ethBalance?.decimals, ethBalance?.symbol)}</strong></p>
      {allowedTokens.map(t => <p key={t}><strong>{formatBalance(balances.get(t)?.value, balances.get(t)?.decimals, balances.get(t)?.symbol)}</strong></p>)}
      <Button onClick={refetch}>Refresh balance</Button>
    </div>
  );
  
}