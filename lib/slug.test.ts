import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("debe convertir texto a minúsculas y reemplazar espacios por guiones", () => {
    const result = slugify("Toxina Botulinica Facial");
    expect(result).toBe("toxina-botulinica-facial");
  });

  it("debe eliminar tildes y diacríticos en español", () => {
    const result = slugify("Ácido Hialurónico e Hidratación");
    expect(result).toBe("acido-hialuronico-e-hidratacion");
  });

  it("debe eliminar caracteres especiales y múltiples guiones consecutivos", () => {
    const result = slugify("¡Procedimiento Especial: Botox & Relleno! (100% Seguro)");
    expect(result).toBe("procedimiento-especial-botox-relleno-100-seguro");
  });

  it("debe recortar guiones al inicio y al final del texto", () => {
    const result = slugify(" --- Cuidado Post Tratamiento --- ");
    expect(result).toBe("cuidado-post-tratamiento");
  });

  it("debe limitar la longitud máxima del slug a 80 caracteres", () => {
    const longTitle = "Este es un titulo extremadamente largo para un procedimiento medico que deberia ser recortado a un maximo de 80 caracteres de longitud";
    const result = slugify(longTitle);
    expect(result.length).toBeLessThanOrEqual(80);
  });
});
