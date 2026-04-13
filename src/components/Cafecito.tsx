export default function Cafecito() {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex flex-row items-center gap-2">
        <span className="text-xs text-center font-semibold text-foreground">¿Conseguiste el mejor precio?</span>
        <span className="text-base font-normal">→</span>
      </div>
      <a href="https://cafecito.app/quien-da-menos" rel="noopener" target="_blank">
        <img
          srcSet="https://cdn.cafecito.app/imgs/buttons/button_4.png 1x, https://cdn.cafecito.app/imgs/buttons/button_4_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_4_3.75x.png 3.75x"
          src="https://cdn.cafecito.app/imgs/buttons/button_4.png"
          alt="Invitame un café en cafecito.app"
        />
      </a>
    </div>
  );
}
