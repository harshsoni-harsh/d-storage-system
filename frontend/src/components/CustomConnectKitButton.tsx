import { ConnectKitButton } from "connectkit";
import { Button } from "./ui/button";

export default function ConnectButton() {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => (
        <Button onClick={show}>
          {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
        </Button>
      )}
    </ConnectKitButton.Custom>
  );
}
