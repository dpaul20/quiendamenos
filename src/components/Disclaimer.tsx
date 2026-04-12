"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export default function Disclaimer() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  return (
    showDisclaimer && (
      <Alert
        variant="destructive"
        className="bg-destructive/10 border-destructive/30 flex flex-row"
      >
        <ExclamationTriangleIcon className="h-4 w-4 text-destructive" />
        <div className="flex flex-col">
          <AlertTitle className="text-sm font-semibold text-destructive">
            Aviso importante
          </AlertTitle>
          <AlertDescription className="mt-1 text-xs text-left text-destructive/80">
            Este proyecto tiene como finalidad permitir a los usuarios comprar
            libremente y de manera unificada el producto que buscan al menor
            precio posible, recopilando información de diversas tiendas de
            tecnología y artículos para el hogar, mediante web scraping. Nuestro
            objetivo es proporcionar una experiencia fluida para comparar
            productos en tiempo real y optimizar la decisión de compra.
          </AlertDescription>
        </div>

        <div>
          <Button
            variant="ghost"
            size="icon"
            className="p-1 h-6 w-6 hover:bg-destructive/20 text-destructive"
            onClick={() => setShowDisclaimer(false)}
          >
            <X className="h-full w-full" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>
      </Alert>
    )
  );
}
