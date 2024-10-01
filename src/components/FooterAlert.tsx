import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Link from "next/link";

export default function FooterAlert() {
  return (
    <Alert variant={"default"} className="max-w-lg text-center mx-auto bg-primary text-primary-foreground">
      <AlertTitle>
        En <strong>&quot;¿Quién da menos?&quot;</strong> ,
      </AlertTitle>
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
          className="font-bold underline"
        >
          Deivy Gutierrez
        </Link>
      </AlertDescription>
    </Alert>
  );
}
