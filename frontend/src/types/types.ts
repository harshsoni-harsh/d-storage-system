export type PeerType = {
  addr: string;
  peer: string;
  latency: string;
  maxStorage: string;
  price: string;
  validTill: string;
  walletAddress: `0x${string}`;
};

export type ProviderType = {
  providerAddress: `0x${string}`;
  pricePerSector: string;
  sectorCount: string;
  validTill: string;
  ipfsPeerId: string;
};

export type DealDialogProps = {
  peer: string;
  addr: string;
  price: string;
  onCreateDeal: ({
    duration,
    storageSize,
  }: {
    duration: string;
    storageSize: string;
  }) => Promise<void>;
  text?: string;
};
