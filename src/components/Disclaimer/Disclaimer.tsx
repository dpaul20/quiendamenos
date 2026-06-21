"use client";
import { useState } from "react";

export default function Disclaimer() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="flex w-full items-start gap-3 rounded-lg bg-amber-300 p-4">
      <div className="flex size-5 shrink-0 items-center justify-center text-amber-900">
        <span className="select-none text-base font-bold italic leading-none">
          i
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-base font-bold text-amber-900">¿Cómo funciona?</p>
        <p className="text-sm font-normal leading-5 text-amber-900">
          Los precios se actualizan en cada búsqueda y pueden variar al momento
          de la compra en cada tienda.
        </p>
      </div>
      <button
        className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded text-amber-900 transition-colors hover:bg-amber-300/20"
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso"
      >
        <span className="select-none text-base leading-none">×</span>
      </button>
    </div>
  );
}
