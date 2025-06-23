export function splitSignature(signature: string) {
  const sig = signature.startsWith("0x") ? signature.slice(2) : signature;
  const r = "0x" + sig.slice(0, 64);
  const s = "0x" + sig.slice(64, 128);
  const vHex = sig.slice(128, 130);
  let v = parseInt(vHex, 16);
  if (v < 27) v += 27;
  return { r, s, v };
}
