import { Market, Tonic } from '@tonic-foundation/tonic';
import { getNearConfig } from '@tonic-foundation/config';
import { Near } from 'near-api-js';
import { getExplorerUrl, getGasUsage, getKeystore } from './util';
import { parse } from 'ts-command-line-args';
import axios from 'axios';

export interface ProgramOptions {
  marketId: string;
  nearAccountId: string;
  tonicContractId: string;
  assetName: string;
  baseQuantity: number;
  network: 'mainnet' | 'testnet';
  orderDelayMs: number;
  spreadBps: number;
}

export interface MarketMakerParams {
  tonic: Tonic;
  market: Market;
  coinGeckoName: string;
  baseQuantity: number;
  spreadBps: number;
  orderDelayMs: number;
  network: 'mainnet' | 'testnet';
}

const client = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/',
});

export const getPrice = async (asset: string) => {
  return client
    .get('simple/price', {
      params: {
        ids: asset,
        vs_currencies: 'usd',
      },
    })
    .then((res) => res.data[asset]['usd']) as unknown as number;
};


async function makeMarket(params: MarketMakerParams) {
  const {
    tonic,
    market,
    coinGeckoName,
    baseQuantity,
    spreadBps,
    orderDelayMs,
    network
  } = params;
  while (true) {
    const indexPrice = await getPrice(coinGeckoName);

    const batch = market.createBatchAction();
    batch.cancelAllOrders();
    const delta = (spreadBps / 2) / 10000;
    const bid = parseFloat((indexPrice * (1 - delta)).toFixed(market.quoteDecimals));
    const ask = parseFloat((indexPrice * (1 + delta)).toFixed(market.quoteDecimals));
    batch.newOrder({
      quantity: baseQuantity,
      side: 'Buy',
      limitPrice: bid,
      orderType: 'Limit',
    });
    batch.newOrder({
      quantity: baseQuantity,
      side: 'Sell',
      limitPrice: ask,
      orderType: 'Limit',
    });
    console.log(`Making market at mid: ${indexPrice} buying at ${bid} selling at ${ask}`);

    try {
      console.log('Sending transaction...');
      const { executionOutcome: tx, response: _ } = await tonic.executeBatch(batch);
      console.log('Transaction', getExplorerUrl(network, 'transaction', tx.transaction_outcome.id));
      console.log(`Gas usage: ${getGasUsage(tx)}`);
    } catch (e) {
      console.log('Order failed', e);
    }
    console.log(`Waiting ${orderDelayMs}ms`);
    await new Promise((resolve) => setTimeout(resolve, orderDelayMs));
  }
}

async function main() {
  const args = parse<ProgramOptions>({
    marketId: String,
    nearAccountId: String,
    tonicContractId: String,
    assetName: String,
    baseQuantity: Number,
    // @ts-ignore
    network: String,
    spreadBps: Number,
    orderDelayMs: Number,
  });
  const keyStore = await getKeystore();
  const near = new Near({ ...getNearConfig(args.network), keyStore });
  const account = await near.account(args.nearAccountId);
  const tonic = new Tonic(account, args.tonicContractId);
  const market = await tonic.getMarket(args.marketId);
  await makeMarket({ tonic, market, coinGeckoName: args.assetName, ...args });
}

main();
