"use client";

import { ConnectKitButton } from "connectkit";
import { useTheme } from "next-themes";

export default function ConnectButton() {
  const { theme } = useTheme();

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => (
        <button
          onClick={show}
          className={`px-4 py-2 rounded-2xl border font-medium transition duration-300
            ${
              theme === "dark"
                ? "bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
                : "bg-white text-black border-gray-300 hover:bg-gray-200"
            }`}
        >
          {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}
