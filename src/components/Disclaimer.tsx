import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function Disclaimer() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Alert variant="destructive" className="mb-6 pr-16 relative ">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle className="text-lg font-semibold">
        Aviso importante
      </AlertTitle>
      <AlertDescription className="mt-2 text-sm">
        Este proyecto tiene como finalidad permitir a los usuarios comprar
        libremente y de manera unificada el producto que buscan al menor precio
        posible, recopilando información de diversas tiendas mediante web
        scraping. La web app proporcionará una experiencia fluida para comparar
        productos en tiempo real y optimizar la decisión de compra.
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-2 -translate-y-1/2 hover:bg-secondary p-1 h-10 w-10"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-8 w-8" />
        <span className="sr-only">Cerrar</span>
      </Button>
    </Alert>
  );
}
