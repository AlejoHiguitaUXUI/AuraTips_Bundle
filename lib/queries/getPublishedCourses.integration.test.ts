import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getPublishedCourses } from "./getPublishedCourses";

describe("getPublishedCourses integration test", () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    console.warn(
      "Variables de Supabase no encontradas en el entorno. Saltando prueba de integración."
    );
    return;
  }

  // Cliente con permisos de administración (Service Role - omite RLS)
  const adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Cliente anónimo (Anon Key - representa un paciente / visitante real sujeto a RLS)
  const anonClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let publishedCourseId: string;
  let draftCourseId: string;
  let ownerId: string;

  beforeAll(async () => {
    // 1. Obtener un perfil existente para asociar la autoría (Dra. Mariana Gómez)
    const { data: profile, error: profileErr } = await adminClient
      .from("profiles")
      .select("id")
      .limit(1)
      .single();

    if (profileErr || !profile) {
      throw new Error(`No se pudo obtener un perfil de prueba: ${profileErr?.message}`);
    }
    ownerId = profile.id;

    const timestamp = Date.now();

    // 2. Insertar curso/protocolo con estado 'published' (publicado) vía admin
    const { data: publishedCourse, error: errPub } = await adminClient
      .from("courses")
      .insert({
        owner_id: ownerId,
        title: `Test Protocolo Publicado ${timestamp}`,
        slug: `test-protocolo-publicado-${timestamp}`,
        description: "Procedimiento de prueba con estado publicado",
        category: "Facial",
        status: "published",
        price: 150,
      })
      .select("id")
      .single();

    if (errPub || !publishedCourse) {
      throw new Error(`Error al insertar curso publicado de prueba: ${errPub?.message}`);
    }
    publishedCourseId = publishedCourse.id;

    // 3. Insertar curso/protocolo con estado 'draft' (borrador) vía admin
    const { data: draftCourse, error: errDraft } = await adminClient
      .from("courses")
      .insert({
        owner_id: ownerId,
        title: `Test Protocolo Borrador ${timestamp}`,
        slug: `test-protocolo-borrador-${timestamp}`,
        description: "Procedimiento preliminar en estado borrador",
        category: "Facial",
        status: "draft",
        price: 150,
      })
      .select("id")
      .single();

    if (errDraft || !draftCourse) {
      throw new Error(`Error al insertar curso borrador de prueba: ${errDraft?.message}`);
    }
    draftCourseId = draftCourse.id;
  });

  afterAll(async () => {
    // Limpieza estricta para no dejar registros residuales en el consultorio
    const idsToDelete = [publishedCourseId, draftCourseId].filter(Boolean);
    if (idsToDelete.length > 0) {
      await adminClient.from("courses").delete().in("id", idsToDelete);
    }
  });

  it("el cliente anónimo ve el curso publicado pero el curso en borrador jamás aparece en el catálogo", async () => {
    // Consultar el catálogo con la función getPublishedCourses usando el cliente anónimo
    const courses = await getPublishedCourses(anonClient);

    // 1. El curso con estado 'published' debe estar presente en el resultado
    const foundPublished = courses.find((c) => c.id === publishedCourseId);
    expect(foundPublished).toBeDefined();
    expect(foundPublished?.status).toBe("published");

    // 2. El curso con estado 'draft' JAMÁS debe aparecer en el resultado
    const foundDraft = courses.find((c) => c.id === draftCourseId);
    expect(foundDraft).toBeUndefined();

    // 3. Verificación de RLS a nivel de base de datos:
    // Incluso si un visitante anónimo intenta consultar el borrador directamente por ID,
    // la política de Row Level Security (RLS) en Postgres debe bloquearlo y devolver 0 filas.
    const { data: directDraftQuery } = await anonClient
      .from("courses")
      .select("id, status")
      .eq("id", draftCourseId);

    expect(directDraftQuery).toEqual([]);
  });
});
