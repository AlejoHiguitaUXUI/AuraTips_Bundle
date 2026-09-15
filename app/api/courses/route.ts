import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

const SLUG_UNIQUE_VIOLATION = "23505";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : null;
  const coverUrl =
    typeof body.cover_url === "string" && body.cover_url.trim()
      ? body.cover_url.trim()
      : null;

  if (!title) {
    return NextResponse.json(
      { error: "Title is required." },
      { status: 400 },
    );
  }

  const baseSlug = slugify(title);
  if (!baseSlug) {
    return NextResponse.json(
      { error: "Title must contain at least one letter or number." },
      { status: 400 },
    );
  }

  // Retry with -2, -3, ... suffixes on slug collision.
  for (let attempt = 0; attempt < 20; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;

    const { data, error } = await supabase
      .from("courses")
      .insert({
        owner_id: user.id,
        title,
        slug,
        description,
        cover_url: coverUrl,
        status: "draft",
      })
      .select("id, slug")
      .single();

    if (!error && data) {
      return NextResponse.json({ course: data }, { status: 201 });
    }

    if (error && error.code !== SLUG_UNIQUE_VIOLATION) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    // else: slug collision, loop and try the next suffix
  }

  return NextResponse.json(
    { error: "Could not generate a unique slug. Try a different title." },
    { status: 409 },
  );
}
