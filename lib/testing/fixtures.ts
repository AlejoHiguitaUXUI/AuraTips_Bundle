import type { Database } from "@/lib/database.types";

export type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

/**
 * Genera un objeto sintético de datos para crear un curso de prueba.
 */
export function createMockCourseData(overrides?: Partial<CourseInsert>): CourseInsert {
  const timestamp = Date.now();
  return {
    owner_id: overrides?.owner_id || "00000000-0000-0000-0000-000000000000",
    title: `Procedimiento de Prueba ${timestamp}`,
    slug: `procedimiento-prueba-${timestamp}`,
    description: "Descripción detallada del procedimiento sintético de prueba.",
    category: "Facial",
    status: "published",
    price: 100,
    pain_level: 1,
    duration_minutes: 45,
    ...overrides,
  };
}

/**
 * Genera un objeto sintético de datos para crear un perfil de prueba.
 */
export function createMockProfileData(overrides?: Partial<ProfileInsert>): ProfileInsert {
  const timestamp = Date.now();
  return {
    id: overrides?.id || `test-user-${timestamp}`,
    display_name: `Dra. Especialista ${timestamp}`,
    bio: "Especialista en medicina estética y cuidado post-tratamiento.",
    avatar_url: "https://example.com/avatar.jpg",
    ...overrides,
  };
}
