"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface PriceAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  onSubmit: (email: string) => Promise<void> | void;
  productName?: string;
  error?: string;
  loading?: boolean;
}

export function PriceAlertDialog({
  open,
  onOpenChange,
  defaultEmail = "",
  onSubmit,
  productName,
  error,
  loading = false,
}: PriceAlertDialogProps) {
  const [email, setEmail] = useState(defaultEmail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recibí alertas de precio</DialogTitle>
          <DialogDescription>
            {productName
              ? `Te avisamos cuando baje el precio de ${productName}.`
              : "Te avisamos cuando baje el precio de este producto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Seguir precio"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
