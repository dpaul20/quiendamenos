"use client";
import { useState } from "react";

export default function Disclaimer() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-amber-300/10 border border-amber-300/20 rounded-lg p-4 flex gap-3 items-start w-full">
      <div className="text-amber-900 flex items-center justify-center shrink-0 size-5">
        <span className="font-bold text-base leading-none select-none">ℹ</span>
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p className="text-base font-bold text-amber-900">¿Cómo funciona?</p>
        <p className="text-sm font-normal leading-5 text-amber-900">
          Los precios se actualizan en cada búsqueda y pueden variar al momento
          de la compra en cada tienda.
        </p>
      </div>
      <button
        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-amber-900 shrink-0 hover:bg-amber-300/20 rounded transition-colors"
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso"
      >
        <span className="text-base leading-none select-none">×</span>
      </button>
    </div>
  );
}
