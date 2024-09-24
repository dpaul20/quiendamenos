// convierte a minúsculas y capitaliza la primera letra
export const capitalize = (brand: string): string => {
  return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
};
