import { getExplorerBaseUrl } from '@tonic-foundation/config';
import { keyStores } from 'near-api-js';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import { homedir } from 'os';

export const getGasUsage = (o: FinalExecutionOutcome) => {
  const receiptGas = o.transaction_outcome.outcome.gas_burnt;
  const actionGas = o.receipts_outcome.reduce((acc, x) => acc + x.outcome.gas_burnt, 0);
  return `${((receiptGas + actionGas) / Math.pow(10, 12)).toFixed(2)} TGas`;
};

export const getKeystore = async () => {
  const HOME_DIR = homedir();
  const CREDENTIALS_DIR = '.near-credentials';
  const credentialsPath = require('path').join(HOME_DIR, CREDENTIALS_DIR);

  return new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);
};

export async function sleep(n: number) {
  return new Promise((resolve) => setTimeout(resolve, n));
}

export function getExplorerUrl(network: 'mainnet' | 'testnet', type: 'account' | 'transaction', id: string) {
  const baseUrl = getExplorerBaseUrl(network);
  if (type === 'account') {
    return `${baseUrl}/address/${id}`;
  }
  if (type === 'transaction') {
    return `${baseUrl}/txns/${id}`;
  }
  throw new Error('Invalid resource type');
}
