import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClinicalRole } from "@/lib/auth-role";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Inicio de sesión requerido." }, { status: 401 });
    }

    const { isSpecialist } = await getClinicalRole(supabase, user);
    if (!isSpecialist) {
      return NextResponse.json(
        { error: "Acceso denegado: solo especialistas pueden subir fotografías clínicas." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo de imagen." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Solo se admiten imágenes JPG, PNG, WEBP o GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. El límite máximo es de 5 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get file extension
    const originalExt = path.extname(file.name) || ".jpg";
    const safeExt = originalExt.toLowerCase();
    const sanitizedBase = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const uniqueFilename = `cover_${Date.now()}_${sanitizedBase}${safeExt}`;

    // Target directory: public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, uniqueFilename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      url: publicUrl,
      filename: uniqueFilename,
      size: file.size,
      type: file.type,
    });
  } catch (err: unknown) {
    console.error("Error al subir archivo de imagen:", err);
    return NextResponse.json(
      { error: "Error interno al procesar y guardar la imagen." },
      { status: 500 }
    );
  }
}
