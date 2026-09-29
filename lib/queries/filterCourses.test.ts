import { describe, it, expect } from "vitest";
import { filterCourses } from "./filterCourses";

describe("filterCourses", () => {
  const mockCourses = [
    {
      id: "proc-1",
      title: "Toxina Botulínica Facial (Botox)",
      slug: "toxina-botulinica-botox-facial",
      category: "Facial",
      description: "Protocolo médico integral de relajación neuromuscular selectiva.",
      price: 0,
      pain_level: 1,
    },
    {
      id: "proc-2",
      title: "Relleno Labial con Ácido Hialurónico",
      slug: "relleno-labial-acido-hialuronico",
      category: "Facial",
      description: "Perfilado e hidratación labial con volumen natural.",
      price: 200,
      pain_level: 2,
    },
    {
      id: "proc-3",
      title: "Morpheus8 Remodelación Corporal",
      slug: "morpheus8-remodelacion-corporal",
      category: "Corporal y Reducción",
      description: "Radiofrecuencia fraccionada subdérmica para flacidez corporal.",
      price: 450,
      pain_level: 3,
    },
    {
      id: "proc-4",
      title: "Mesoterapia Capilar Fortalecedora",
      slug: "mesoterapia-capilar-fortalecedora",
      category: "Capilar",
      description: "Bioestimulación del folículo piloso con micronutrientes activos.",
      price: 120,
      pain_level: 2,
    },
  ];

  // Criterio 1: Filtrado por texto (búsqueda en título/descripción, insensible a mayúsculas/minúsculas)
  it("debe filtrar por texto coincidiendo con el título o descripción de forma insensible a mayúsculas", () => {
    // Coincidencia en título
    const resultByTitle = filterCourses(mockCourses, { search: "botox" });
    expect(resultByTitle).toHaveLength(1);
    expect(resultByTitle[0].id).toBe("proc-1");

    // Coincidencia en descripción
    const resultByDescription = filterCourses(mockCourses, { search: "volumen natural" });
    expect(resultByDescription).toHaveLength(1);
    expect(resultByDescription[0].id).toBe("proc-2");

    // Insensibilidad a mayúsculas/minúsculas
    const resultCaseInsensitive = filterCourses(mockCourses, { search: "MORPHEUS8" });
    expect(resultCaseInsensitive).toHaveLength(1);
    expect(resultCaseInsensitive[0].id).toBe("proc-3");

    // Búsqueda sin coincidencias debe retornar vacío
    const noResults = filterCourses(mockCourses, { search: "termino-inexistente" });
    expect(noResults).toHaveLength(0);
  });

  // Criterio 2: Filtrado por precio (filtro por límite de precio / costo)
  it("debe filtrar por precio retornando únicamente los cursos que no superan el precio máximo establecido", () => {
    // Precio límite 200 (debe incluir 0, 120, 200 y excluir 450)
    const resultUnder200 = filterCourses(mockCourses, { maxPrice: 200 });
    expect(resultUnder200).toHaveLength(3);
    expect(resultUnder200.map((c) => c.id)).toEqual(["proc-1", "proc-2", "proc-4"]);
    expect(resultUnder200.some((c) => c.price > 200)).toBe(false);

    // Precio límite 0 (solo gratuitos / sin costo adicional)
    const resultFree = filterCourses(mockCourses, { maxPrice: 0 });
    expect(resultFree).toHaveLength(1);
    expect(resultFree[0].id).toBe("proc-1");

    // Límite estricto por debajo de cualquier curso de pago
    const resultUnder50 = filterCourses(mockCourses, { maxPrice: 50 });
    expect(resultUnder50).toHaveLength(1);
    expect(resultUnder50[0].price).toBeLessThanOrEqual(50);
  });

  // Criterio 3: Filtrado por categoría (médica / catálogo)
  it("debe filtrar por categoría médica devolviendo únicamente los procedimientos correspondientes a dicha categoría", () => {
    // Filtrar categoría Facial
    const resultFacial = filterCourses(mockCourses, { category: "Facial" });
    expect(resultFacial).toHaveLength(2);
    expect(resultFacial.map((c) => c.id)).toEqual(["proc-1", "proc-2"]);
    expect(resultFacial.every((c) => c.category === "Facial")).toBe(true);

    // Filtrar categoría Corporal y Reducción
    const resultCorporal = filterCourses(mockCourses, { category: "Corporal y Reducción" });
    expect(resultCorporal).toHaveLength(1);
    expect(resultCorporal[0].id).toBe("proc-3");
    expect(resultCorporal[0].category).toBe("Corporal y Reducción");

    // Categoría inexistente retorna array vacío
    const resultInexistente = filterCourses(mockCourses, { category: "Odontología" });
    expect(resultInexistente).toHaveLength(0);
  });
});
