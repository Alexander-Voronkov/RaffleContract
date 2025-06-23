import { formatUnits } from "viem";

export function formatBalance(
  value?: bigint,
  decimals?: number,
  symbol?: string,
) {
  return `${formatUnits(value ?? 0n, decimals ?? 18)} ${symbol ?? "units"}`;
}
