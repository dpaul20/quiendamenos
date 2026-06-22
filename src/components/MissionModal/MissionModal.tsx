import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MissionModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="h-10 rounded-md bg-primary px-4 text-sm font-semibold uppercase text-primary-foreground">
          ¿Quién da menos?
        </button>
      </DialogTrigger>

      <DialogContent className="flex max-w-[425px] flex-col gap-4 rounded-xl p-6 [&>button.absolute]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 p-0">
          <DialogTitle className="text-xl font-bold text-foreground">
            ¿Quién da menos?
          </DialogTitle>
          <DialogClose className="flex h-7 w-7 items-center justify-center rounded-sm bg-secondary text-muted-foreground hover:bg-secondary/80">
            <span className="select-none text-base leading-none">×</span>
          </DialogClose>
        </DialogHeader>

        <p className="text-sm leading-[1.6] text-muted-foreground">
          Creemos en la transparencia y en la posibilidad de ofrecer a los
          consumidores las mejores opciones de compra.
        </p>

        <p className="text-sm leading-[1.6] text-muted-foreground">
          Invitamos a todas las empresas y tiendas a compartir sus APIs con
          nosotros para participar en una plataforma donde la competencia se
          basa en la calidad y los precios más bajos.
        </p>

        <div className="flex flex-wrap items-center justify-end gap-1 text-sm">
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
