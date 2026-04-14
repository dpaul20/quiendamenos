import Image from "next/image";

export default function Cafecito() {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex flex-row items-center gap-2">
        <span className="text-xs text-center font-semibold text-foreground">¿Conseguiste el mejor precio?</span>
        <span className="text-base font-normal">→</span>
      </div>
      <a href="https://cafecito.app/quien-da-menos" rel="noopener" target="_blank">
        <Image
          src="https://cdn.cafecito.app/imgs/buttons/button_4.png"
          alt="Invitame un café en cafecito.app"
          width={150}
          height={35}
          sizes="(max-width: 600px) 100vw, 150px"
          style={{ height: "auto", width: "auto" }}
          priority
        />
      </a>
    </div>
  );
}
