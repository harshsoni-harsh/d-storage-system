import Web3 from "web3";

const getWeb3 = (): Web3 => {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new Web3((window as any).ethereum);
  }
  throw new Error("No Web3 provider detected.");
};

export default getWeb3;