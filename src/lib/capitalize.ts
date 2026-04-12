// convierte a minúsculas y capitaliza la primera letra; retorna vacío si el valor es falsy
export const capitalize = (brand: string | undefined): string => {
  if (!brand) return "";
  return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
};
