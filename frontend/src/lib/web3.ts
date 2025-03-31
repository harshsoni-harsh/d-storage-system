import Web3 from "web3";

const getWeb3 = (): Web3 => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new Web3(window.ethereum);
  }
  throw new Error("No Web3 provider detected.");
};

export default getWeb3;
