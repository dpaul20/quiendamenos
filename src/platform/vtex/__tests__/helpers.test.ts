import { getMaxFreeInstallments } from "../helpers";
import type { VtexInstallment } from "../helpers";

const inst = (
  PaymentSystemName: string,
  NumberOfInstallments: number,
  InterestRate: number,
): VtexInstallment => ({
  PaymentSystemName,
  NumberOfInstallments,
  InterestRate,
  Value: 0,
  TotalValuePlusInterestRate: 0,
  Name: `${PaymentSystemName} ${NumberOfInstallments}x`,
  __typename: "Installment",
});

describe("getMaxFreeInstallments", () => {
  it("sin cuotas devuelve 0", () => {
    expect(getMaxFreeInstallments([])).toBe(0);
  });

  it("todas con interés devuelve 0", () => {
    const installments = [
      inst("Visa", 3, 3.5),
      inst("Visa", 6, 5.0),
      inst("Mastercard", 12, 4.2),
    ];
    expect(getMaxFreeInstallments(installments)).toBe(0);
  });

  it("un solo medio de pago devuelve su máximo sin interés", () => {
    const installments = [
      inst("Visa", 1, 0),
      inst("Visa", 3, 0),
      inst("Visa", 6, 0),
      inst("Visa", 12, 3.5),
    ];
    expect(getMaxFreeInstallments(installments)).toBe(6);
  });

  it("todos los medios de pago coinciden → devuelve ese valor", () => {
    const installments = [
      inst("Visa", 1, 0),
      inst("Visa", 12, 0),
      inst("Mastercard", 1, 0),
      inst("Mastercard", 12, 0),
      inst("Cabal", 1, 0),
      inst("Cabal", 12, 0),
    ];
    expect(getMaxFreeInstallments(installments)).toBe(12);
  });

  it("un medio de pago con promo bancaria mayor → devuelve la moda (valor común)", () => {
    // OnCity Oster: AmEx=12, Visa=15, Mastercard=20 (promo bancaria), Cabal=12, Naranja=12
    const installments = [
      inst("American Express", 1, 0),
      inst("American Express", 12, 0),
      inst("Visa", 1, 0),
      inst("Visa", 15, 0),
      inst("Mastercard", 1, 0),
      inst("Mastercard", 20, 0),  // promo bancaria
      inst("Cabal", 1, 0),
      inst("Cabal", 12, 0),
      inst("Naranja", 1, 0),
      inst("Naranja", 12, 0),
    ];
    expect(getMaxFreeInstallments(installments)).toBe(12);
  });

  it("empate en frecuencia → devuelve el valor más bajo", () => {
    // Visa=6, Mastercard=12 → empate 1 vs 1, gana el menor
    const installments = [
      inst("Visa", 6, 0),
      inst("Mastercard", 12, 0),
    ];
    expect(getMaxFreeInstallments(installments)).toBe(6);
  });

  it("ignora cuotas de 1 (pago en una cuota siempre tiene 0% interés)", () => {
    // Solo cuotas de 1 con 0% no cuenta como CSI real
    const installments = [
      inst("Visa", 1, 0),
      inst("Mastercard", 1, 0),
    ];
    expect(getMaxFreeInstallments(installments)).toBe(0);
  });

  it("mezcla de con y sin interés → solo considera las sin interés", () => {
    const installments = [
      inst("Visa", 1, 0),
      inst("Visa", 6, 0),
      inst("Visa", 12, 4.5),
      inst("Mastercard", 1, 0),
      inst("Mastercard", 6, 0),
      inst("Mastercard", 12, 4.5),
    ];
    expect(getMaxFreeInstallments(installments)).toBe(6);
  });
});
