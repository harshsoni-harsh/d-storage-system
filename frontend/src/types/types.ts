export type AddressType = `0x${string}`;

export type PeerType = {
  addr: string;
  peer: string;
  latency: string;
  maxStorage: string;
  price: string;
  validTill: string;
  walletAddress: AddressType;
};

export type ProviderType = {
  providerAddress: AddressType;
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
    duration: number;
    storageSize: number;
  }) => Promise<void>;
  text?: string;
};

export type ProviderDealType = {
  addr: AddressType;
  status: 'Active' | 'Completed' | 'Waiting for Approval';
  price: number;
  remainingStorage?: number;
  validTill: number;
  cancelReason?: string;
};

export type UserDealType = {
  addr: AddressType;
  status: 'Active' | 'Completed' | 'Waiting for Approval';
  price: number;
  remainingStorage?: number;
  remainingDuration?: string;
  validTill: number;
  cancelReason?: string;
};
