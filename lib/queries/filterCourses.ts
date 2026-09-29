/**
 * AuraTips · Consultorio Clínico Dra. Mariana Gómez
 * Utilidad pura de filtrado para el catálogo de procedimientos y cursos médicos.
 *
 * REGLAS ARQUITECTÓNICAS:
 * 1. Función 100% pura: sin llamadas a red, sin dependencias de Supabase, sin efectos secundarios.
 * 2. Determinista y desacoplada de la capa de transporte/datos.
 * 3. Soporta tanto entidades clínicas locales (CLINICAL_PROCEDURES) como registros de base de datos (courses).
 */

export interface CourseFilters {
  /**
   * Categoría médica (ej. "Facial", "Corporal y Reducción", "Capilar", "Inyectables").
   * Si es "Todos" (case-insensitive) o se omite, no filtra por categoría.
   */
  category?: string;

  /**
   * Búsqueda por texto libre (en título, descripción, slug o categoría).
   * Insensible a mayúsculas y acentos diacríticos.
   */
  search?: string;

  /**
   * Alias de búsqueda por texto (compatibilidad con query/text).
   */
  text?: string;

  /**
   * Alias adicional para búsqueda por texto.
   */
  query?: string;

  /**
   * Precio máximo (o alias de precio tope).
   */
  price?: number;

  /**
   * Precio mínimo del procedimiento o curso.
   */
  minPrice?: number;

  /**
   * Precio máximo del procedimiento o curso.
   */
  maxPrice?: number;

  /**
   * Nivel máximo de molestia/dolor esperado (escala clínica 1 a 5).
   */
  maxPainLevel?: number;
}

export interface FilterableCourse {
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  description?: string | null;
  price?: number | null;
  precio?: number | null;
  pain_level?: number | null;
  [key: string]: unknown;
}

/**
 * Normaliza una cadena para búsquedas: minúsculas, sin espacios superfluos y sin acentos.
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Función pura para filtrar cursos y procedimientos clínicos en memoria.
 *
 * NO realiza llamadas a red, base de datos ni Supabase.
 * Recibe un array ya cargado y devuelve una nueva lista filtrada sin mutar el array original.
 *
 * @param courses Lista de cursos o procedimientos ya cargados en memoria.
 * @param filters Criterios de filtrado (categoría, texto, rango de precio, molestia clínica).
 * @returns Array filtrado con los elementos que cumplen todos los criterios aplicables.
 */
export function filterCourses<T extends FilterableCourse>(
  courses: readonly T[] | null | undefined,
  filters?: CourseFilters
): T[] {
  if (!courses || courses.length === 0) {
    return [];
  }

  if (!filters) {
    return [...courses];
  }

  const normalizedCategory = filters.category?.trim();
  const isAllCategories =
    !normalizedCategory ||
    normalizedCategory.toLowerCase() === "todos" ||
    normalizedCategory.toLowerCase() === "all";

  const rawQuery = filters.search ?? filters.text ?? filters.query;
  const normalizedQuery = rawQuery ? normalizeString(rawQuery) : "";
  const queryTokens = normalizedQuery
    ? normalizedQuery.split(/\s+/).filter(Boolean)
    : [];

  const maxPriceLimit =
    filters.maxPrice !== undefined && filters.maxPrice !== null
      ? filters.maxPrice
      : filters.price !== undefined && filters.price !== null
        ? filters.price
        : undefined;

  return courses.filter((course) => {
    // 1. Filtro por categoría médica
    if (!isAllCategories) {
      if (!course.category) return false;
      if (course.category.toLowerCase() !== normalizedCategory!.toLowerCase()) {
        return false;
      }
    }

    // 2. Filtro por texto / búsqueda (título, descripción, slug, categoría)
    if (queryTokens.length > 0) {
      const title = course.title ? normalizeString(course.title) : "";
      const description = course.description ? normalizeString(course.description) : "";
      const slug = course.slug ? normalizeString(course.slug) : "";
      const category = course.category ? normalizeString(course.category) : "";

      const haystack = `${title} ${description} ${slug} ${category}`;

      // Todos los tokens deben coincidir en el contenido
      const matchesAllTokens = queryTokens.every((token) => haystack.includes(token));
      if (!matchesAllTokens) {
        return false;
      }
    }

    // 3. Filtro por precio mínimo
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      const itemPrice = course.price ?? course.precio ?? 0;
      if (itemPrice < filters.minPrice) {
        return false;
      }
    }

    // 4. Filtro por precio máximo
    if (maxPriceLimit !== undefined) {
      const itemPrice = course.price ?? course.precio ?? 0;
      if (itemPrice > maxPriceLimit) {
        return false;
      }
    }

    // 5. Filtro clínico adicional: nivel de molestia esperado (1 a 5)
    if (filters.maxPainLevel !== undefined && filters.maxPainLevel !== null) {
      const painLevel = course.pain_level ?? 1;
      if (painLevel > filters.maxPainLevel) {
        return false;
      }
    }

    return true;
  });
}
