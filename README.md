## Tonic trading bot example

Simple example to get you up and running using Tonic's SDK. This program takes a price feed and quotes a spread on a Tonic market.

## Getting started

### Install the Tonic CLI
```bash
npm i -g @tonic-foundation/cli
export TONIC_CONTRACT_ID=v1.orderbook.near
export MARKET_ID=2UmzUXYpaZg4vXfFVmD7r8mYUYkKEF19xpjLw7ygDUwp # NEAR/USDC
export YOUR_ACCOUNT_ID= # your NEAR wallet address
export NEAR_ENV=mainnet

# register account with the exchange
tonic storage-deposit --accountId $YOUR_ACCOUNT_ID --registration-only
```

### Run the bot
The following will trade on NEAR/USDC on mainnet, buying and selling 1 NEAR with a 0.50% spread once per minute. The price feed is from CoinGecko's API. 

```bash
yarn
yarn make-market \
    --network=mainnet \
    --nearAccountId=$YOUR_ACCOUNT_ID \
    --tonicContractId=v1.orderbook.near \
    --marketId=$MARKET_ID \
    --assetName=near \
    --baseQuantity=1 \
    --spreadBps=50 \
    --orderDelayMs 60000
```