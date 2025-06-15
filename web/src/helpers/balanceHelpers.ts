export function formatBalance(value?: bigint, decimals?: number, symbol?: string) {
    return `${(value ?? BigInt(0)) / BigInt(10 ** (decimals ?? 1))} - ${symbol ?? 'units'}`;
}