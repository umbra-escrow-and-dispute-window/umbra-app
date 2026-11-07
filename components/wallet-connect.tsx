"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { truncateAddress } from "../lib/format";

export interface WalletState {
  isConnected: boolean;
  address: string;
  role: "Buyer" | "Seller" | "Arbiter" | "Custom";
}

const DEFAULT_ACCOUNTS = {
  Buyer: "GBBD67VFO7CTP3S5BX7A5UOHQLWJ2C3Z7G4V5N3A2B1C0D9E8F7A6B5C",
  Seller: "GAKF4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
  Arbiter: "GARB4W2N3M5L6K7J8H9G0F1E2D3C4B5A6B7C8D9E0F1A2B3C4D5E6F7A",
};

interface WalletConnectProps {
  onAccountChange?: (account: WalletState) => void;
  defaultRole?: "Buyer" | "Seller" | "Arbiter";
}

export function WalletConnect({ onAccountChange, defaultRole = "Buyer" }: WalletConnectProps) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: true,
    address: DEFAULT_ACCOUNTS[defaultRole],
    role: defaultRole,
  });
  const [customAddress, setCustomAddress] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    onAccountChange?.(wallet);
  }, [wallet, onAccountChange]);

  const selectRole = (role: "Buyer" | "Seller" | "Arbiter") => {
    const next: WalletState = {
      isConnected: true,
      address: DEFAULT_ACCOUNTS[role],
      role,
    };
    setWallet(next);
    setShowModal(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddress.trim()) return;
    const next: WalletState = {
      isConnected: true,
      address: customAddress.trim(),
      role: "Custom",
    };
    setWallet(next);
    setShowModal(false);
  };

  const disconnect = () => {
    const next: WalletState = {
      isConnected: false,
      address: "",
      role: "Custom",
    };
    setWallet(next);
  };

  return (
    <div className="flex items-center gap-3">
      {wallet.isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {wallet.role}
          </Badge>
          <span className="font-mono text-neutral-600 dark:text-neutral-300">
            {truncateAddress(wallet.address, 4)}
          </span>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 ml-1 underline"
          >
            Switch
          </button>
        </div>
      ) : (
        <Button size="sm" onClick={() => setShowModal(true)}>
          Connect Account
        </Button>
      )}

      {/* Account Selector Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Select Testnet Account
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Choose a sandbox persona or enter your own Stellar testnet public key.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => selectRole("Buyer")}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left"
              >
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Buyer Persona
                  </p>
                  <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                    {truncateAddress(DEFAULT_ACCOUNTS.Buyer, 6)}
                  </p>
                </div>
                <Badge variant="outline">Buyer</Badge>
              </button>

              <button
                type="button"
                onClick={() => selectRole("Seller")}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left"
              >
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Seller Persona
                  </p>
                  <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                    {truncateAddress(DEFAULT_ACCOUNTS.Seller, 6)}
                  </p>
                </div>
                <Badge variant="outline">Seller</Badge>
              </button>

              <button
                type="button"
                onClick={() => selectRole("Arbiter")}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left"
              >
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Arbiter Persona
                  </p>
                  <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                    {truncateAddress(DEFAULT_ACCOUNTS.Arbiter, 6)}
                  </p>
                </div>
                <Badge variant="outline">Arbiter</Badge>
              </button>
            </div>

            <form
              onSubmit={handleCustomSubmit}
              className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-3"
            >
              <label className="block text-xs font-semibold uppercase text-neutral-500">
                Or Use Custom Address
              </label>
              <Input
                type="text"
                placeholder="G..."
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                className="font-mono text-xs"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                {wallet.isConnected && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      disconnect();
                      setShowModal(false);
                    }}
                  >
                    Disconnect
                  </Button>
                )}
                <Button type="submit" size="sm" disabled={!customAddress.trim()}>
                  Set Custom
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
