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
        className="bg-orange-100 border-orange-300 flex flex-row"
      >
        <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
        <div className="flex flex-col">
          <AlertTitle className="text-lg font-semibold text-orange-700">
            Aviso importante
          </AlertTitle>
          <AlertDescription className="mt-2 text-xs lg:text-base text-left text-orange-600">
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
            className="p-1 h-6 w-6 hover:bg-orange-200 text-orange-500"
            onClick={() => setShowDisclaimer(false)}
          >
            <X className="h-full w-full hover:text-orange-700" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>
      </Alert>
    )
  );
}
