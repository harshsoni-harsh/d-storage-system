import { fetchDealDetails, fetchProviderDeals } from "@/lib/web3";
import { AddressType, DealType } from "@/types/types";
import { create } from "zustand";

interface StoreState {
  deals: DealType[];
  fetchDeals: () => {};
  activateDeal: (userAddress: AddressType) => void;
}

const providerStore = create<StoreState>((set) => ({
  deals: [],
  fetchDeals: async () => {
    try {
      const deals = await fetchProviderDeals();
      const dealsData = (await Promise.all(
        deals.map(async (dealAddress: AddressType): Promise<DealType> => {
          const details = await fetchDealDetails(dealAddress);

          let status: DealType["status"] = "Active";
          if (details.completed) status = "Completed";
          else if (!details.isActive) status = "Waiting for Approval";

          return {
            userAddr: details.userAddress,
            dealAddr: dealAddress,
            status,
            price: Number(details.pricePerSector),
            remainingStorage: Number(details.sectorCount),
            validTill: Number(details.validTill),
          } as DealType;
        }),
      )) as DealType[];

      set({ deals: dealsData });
    } catch (error) {
      console.error(
        "Error fetching deals:",
        error instanceof Error ? error.message : error,
      );
      throw new Error("Error fetching deals");
    }
  },
  activateDeal: (userAddress: AddressType) =>
    set(({ deals }) => ({
      deals: deals.map((deal) =>
        deal.dealAddr === userAddress ? { ...deal, status: "Active" } : deal,
      ),
    })),
}));

export default providerStore;
