const UA = 'mrfentmen-blockcypher-mcp/1.0';

const COINS = new Set(['btc', 'eth', 'ltc', 'doge']);

export interface CoinAddressArgs {
  coin: string;
  address: string;
}
export interface CoinHeightArgs {
  coin: string;
  height: string;
}

export async function addressBalance(args: CoinAddressArgs): Promise<string> {
  const coin = String(args.coin || 'btc').toLowerCase();
  if (!COINS.has(coin)) throw new Error(`Unsupported coin ${coin}. Use btc, eth, ltc, or doge.`);
  const res = await fetch(`https://api.blockcypher.com/v1/${coin}/main/addrs/${encodeURIComponent(args.address)}/balance`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`BlockCypher returned ${res.status}`);
  const d = (await res.json()) as { address?: string; balance?: number; unconfirmed_balance?: number; final_balance?: number; total_received?: number };
  if (d.address == null) throw new Error('No address returned.');
  return `Address ${d.address}\nBalance: ${(d.balance ?? 0) / 1e8} ${coin.toUpperCase()}\nFinal balance: ${(d.final_balance ?? 0) / 1e8}\nUnconfirmed: ${(d.unconfirmed_balance ?? 0) / 1e8}\nTotal received: ${(d.total_received ?? 0) / 1e8}`;
}

export async function blockInfo(args: CoinHeightArgs): Promise<string> {
  const coin = String(args.coin || 'btc').toLowerCase();
  if (!COINS.has(coin)) throw new Error(`Unsupported coin ${coin}.`);
  const res = await fetch(`https://api.blockcypher.com/v1/${coin}/main/blocks/${encodeURIComponent(args.height)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`BlockCypher returned ${res.status}`);
  const d = (await res.json()) as { height?: number; hash?: string; time?: string; n_tx?: number; total?: number; size?: number };
  if (d.hash == null) throw new Error('No block returned.');
  return `Block ${d.height}\nHash: ${d.hash}\nTime: ${d.time ?? '?'}\nTransactions: ${d.n_tx ?? 0}\nSize: ${d.size ?? 0} bytes\nTotal moved: ${(d.total ?? 0) / 1e8} ${coin.toUpperCase()}`;
}

export async function txInfo(args: CoinAddressArgs): Promise<string> {
  const coin = String(args.coin || 'btc').toLowerCase();
  if (!COINS.has(coin)) throw new Error(`Unsupported coin ${coin}.`);
  const res = await fetch(`https://api.blockcypher.com/v1/${coin}/main/txs/${encodeURIComponent(args.address)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`BlockCypher returned ${res.status}`);
  const d = (await res.json()) as { hash?: string; block_height?: number; confirmations?: number; total?: number; fees?: number; size?: number; received?: string };
  if (d.hash == null) throw new Error('No transaction returned.');
  return `Transaction ${d.hash}\nBlock: ${d.block_height ?? 'unconfirmed'}\nConfirmations: ${d.confirmations ?? 0}\nTotal: ${(d.total ?? 0) / 1e8} ${coin.toUpperCase()}\nFees: ${(d.fees ?? 0) / 1e8}\nSize: ${d.size ?? 0} bytes\nReceived: ${d.received ?? '?'}`;
}
