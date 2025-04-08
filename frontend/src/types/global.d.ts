import type { EthereumProvider } from "@walletconnect/ethereum-provider";

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
