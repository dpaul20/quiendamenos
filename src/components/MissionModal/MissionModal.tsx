import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MissionModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-primary h-10 px-4 rounded-md text-sm font-semibold text-primary-foreground uppercase">
          ¿Quién da menos?
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[425px] p-6 rounded-xl flex flex-col gap-4">
        <DialogHeader className="p-0 space-y-0">
          <DialogTitle className="text-xl font-bold text-foreground">
            ¿Quién da menos?
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground leading-[1.6]">
          Creemos en la transparencia y en la posibilidad de ofrecer a los
          consumidores las mejores opciones de compra.
        </p>

        <p className="text-sm text-muted-foreground leading-[1.6]">
          Invitamos a todas las empresas y tiendas a compartir sus APIs con
          nosotros para participar en una plataforma donde la competencia se
          basa en la calidad y los precios más bajos.
        </p>

        <div className="flex gap-1 items-center justify-end flex-wrap text-sm">
          <span className="text-muted-foreground">
            Con mucho esfuerzo y dedicación,
          </span>
          <Link
            href="https://deivygutierrez.com"
            target="_blank"
            className="font-semibold text-foreground underline"
          >
            Deivy Gutierrez
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
