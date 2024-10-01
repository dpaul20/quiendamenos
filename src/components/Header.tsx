import Image from "next/image";
import Cafecito from "./Cafecito";

export default function Header() {
  return (
    <div className="flex flex-col lg:flex-row justify-center lg:justify-between items-center gap-4">
      <div className="flex flex-col lg:flex-row justify-center items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={64} height={64} />
        <h1 className="text-2xl lg:text-4xl font-bold text-center uppercase">
          ¿Quién da menos...?
        </h1>
      </div>

      <Cafecito />
    </div>
  );
}
