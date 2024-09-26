import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { RocketIcon } from "lucide-react";
import Link from "next/link";

export default function FooterAlert() {
  return (
    <Alert className="max-w-lg bg-green-200 text-center mx-auto">
      <RocketIcon className="h-4 w-4" />
      <AlertTitle>En &quot;¿Quién da menos?&quot;,</AlertTitle>
      <AlertDescription>
        creemos en la transparencia y en la posibilidad de ofrecer a los
        consumidores las mejores opciones de compra.
      </AlertDescription>
      <AlertDescription>
        Invitamos a todas las empresas y tiendas a compartir sus APIs con
        nosotros para participar en una plataforma donde la competencia se basa
        en la calidad y los precios más competitivos.
      </AlertDescription>
      <br />
      <AlertDescription>
        Con mucho esfuerzo y dedicación,{" "}
        <Link
          href="https://deivygutierrez.com"
          target="_blank"
          className="font-bold underline text-green-900"
        >
          Deivy Gutierrez
        </Link>
      </AlertDescription>
    </Alert>
  );
}
