import { Dialog } from "@radix-ui/react-dialog";
import Link from "next/link";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

export default function MissionModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="uppercase">
          ¿Quién da menos?
        </Button>

      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            ¿Quién da menos?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p className="mb-4">
            Creemos en la transparencia y en la posibilidad de ofrecer a los
            consumidores las mejores opciones de compra.
          </p>
          <p className="mb-4">
            Invitamos a todas las empresas y tiendas a compartir sus APIs con
            nosotros para participar en una plataforma donde la competencia se
            basa en la calidad y los precios más bajos.
          </p>
          <p className="text-right italic">
            Con mucho esfuerzo y dedicación,{" "}
            <Link
              href="https://deivygutierrez.com"
              target="_blank"
              className="font-bold underline"
            >
              Deivy Gutierrez
            </Link>
          </p>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
