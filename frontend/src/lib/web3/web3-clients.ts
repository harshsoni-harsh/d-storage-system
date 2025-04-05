'use client'

import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { mainnet, hardhat } from 'viem/chains'
 
export const getPublicClient = () => createPublicClient({
  chain: hardhat,
  transport: http(process.env.NEXT_PUBLIC_HARDHAT_RPC_URL ?? ''),
})

const isEthereumAvailable = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

// eg: Metamask
export const getWalletClient = () => isEthereumAvailable ? createWalletClient({
  chain: hardhat,
  transport: custom(window.ethereum!),
}) : null;

export const getAccount = async () => {
  const walletClient = getWalletClient();
  if (!walletClient) {
    throw new Error('Ethereum provider is not available. Please install Metamask or use a supported browser.');
  }
  const [account] = await walletClient.getAddresses()
  return account;
}
