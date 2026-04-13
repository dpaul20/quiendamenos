"use client";
import { useState } from "react";

export default function Disclaimer() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-red-50 border border-destructive rounded-lg p-4 flex gap-3 items-start w-full">
      <div className="bg-destructive rounded-[10px] size-5 flex items-center justify-center shrink-0">
        <span className="font-bold text-sm text-white leading-none select-none">!</span>
      </div>
      <div className="flex flex-col gap-1 flex-1 text-destructive min-w-0">
        <p className="text-base font-bold">Aviso importante</p>
        <p className="text-sm font-normal leading-5">
          Este proyecto permite comparar precios de electrónica en las
          principales tiendas de Argentina mediante web scraping. Los precios
          son referenciales y pueden diferir del precio final.
        </p>
      </div>
      <button
        className="size-6 rounded flex items-center justify-center text-destructive shrink-0 hover:bg-destructive/10 transition-colors"
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso"
      >
        <span className="text-base leading-none select-none">×</span>
      </button>
    </div>
  );
}
