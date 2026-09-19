import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function getOrCreateUser(email, password, userMetadata, profileData) {
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  let user = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.log(`Creating auth user: ${email}...`);
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: userMetadata,
    });
    if (createError) throw createError;
    user = createData.user;
  } else {
    console.log(`Auth user already exists: ${email} (${user.id})`);
    // Ensure metadata is updated
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: userMetadata,
    });
  }

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: profileData.display_name,
      bio: profileData.bio,
      avatar_url: profileData.avatar_url,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error(`Error updating profile for ${email}:`, profileError);
    throw profileError;
  }

  console.log(`Profile ready for ${email} (${profileData.display_name})`);
  return user;
}

const COURSES_DATA = [
  {
    title: "Arquitectura RAG de Cero a Producción",
    slug: "arquitectura-rag-de-cero-a-produccion",
    description:
      "Aprende a construir sistemas de Retrieval-Augmented Generation (RAG) robustos, precisos y escalables utilizando embeddings vectoriales, bases de datos vectoriales (pgvector, Qdrant) y modelos LLM de última generación.",
    cover_url:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    price: 49.99,
    modules: [
      {
        title: "Módulo 1: Fundamentos de Embeddings y Vector Spaces",
        position: 1,
        lessons: [
          {
            title: "Introducción a Embeddings y Modelos de Representación Semántica",
            position: 1,
            youtube_url: "https://www.youtube.com/watch?v=2TJxpyO3ei4",
            body_md: `# Introducción a Embeddings

Los embeddings vectoriales transforman texto no estructurado en representaciones matemáticas dentro de un espacio multidimensional.

### Conceptos Clave:
1. **Similitud de Coseno**: Medida fundamental de proximidad angular entre vectores.
2. **Dimensiones**: Embeddings densos típicos oscilan entre 384 y 3072 dimensiones.
3. **Modelos de Embedding**: OpenAI text-embedding-3, Cohere Embed, HuggingFace sentence-transformers.

\`\`\`python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')

sentences = ['RAG combina recuperación y generación', 'Los embeddings capturan semántica']
embeddings = model.encode(sentences)
print(embeddings.shape)
\`\`\`
`,
          },
          {
            title: "Estrategias de Chunking y Preprocesamiento de Documentos",
            position: 2,
            youtube_url: "https://www.youtube.com/watch?v=8OJC21T2SL4",
            body_md: `# Estrategias de Chunking

Dividir documentos de manera efectiva es el 80% del éxito en una canalización RAG.

### Métodos de Chunking:
- **Chunking por tamaño fijo**: Rápido pero puede cortar frases por la mitad.
- **Chunking semántico**: Agrupa texto por párrafos, markdown headers o cambio de temática.
- **Overlap**: Superposición del 10-15% para no perder contexto en las fronteras.
`,
          },
        ],
      },
      {
        title: "Módulo 2: Indexación, Búsqueda Vectorial y Reranking",
        position: 2,
        lessons: [
          {
            title: "Configuración de pgvector y Búsqueda Híbrida",
            position: 1,
            youtube_url: "https://www.youtube.com/watch?v=QdDoFfkBcgk",
            body_md: `# Búsqueda Híbrida con Postgres y pgvector

Combinar búsqueda de palabras clave (BM25 / Full-text search) con búsqueda semántica vectorial ofrece la máxima tasa de acierto (Recall).

\`\`\`sql
-- Habilitar extensión en Postgres
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla con columna vectorial de 1536 dimensiones
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding vector(1536)
);
\`\`\`
`,
          },
          {
            title: "Implementación de Rerankers y Generación con Contexto",
            position: 2,
            youtube_url: "https://www.youtube.com/watch?v=tcqEUSNCn8I",
            body_md: `# Reranking de Documentos

El reranker analiza la consulta del usuario y el texto completo de los mejores 25 chunks para reordenarlos según relevancia directa antes de pasarlos al LLM generador.
`,
          },
        ],
      },
    ],
  },
  {
    title: "Deep Learning y Redes Neuronales con PyTorch",
    slug: "deep-learning-y-redes-neuronales-con-pytorch",
    description:
      "Domina los fundamentos y aplicaciones prácticas del aprendizaje profundo moderno. Desde operaciones matriciales y autograd con tensores en GPU, hasta arquitecturas convolucionales y transformers.",
    cover_url:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    price: 59.99,
    modules: [
      {
        title: "Módulo 1: Tensores, Autograd y Redes Feed-Forward",
        position: 1,
        lessons: [
          {
            title: "Manipulación de Tensores en GPU y Diferenciación Automática",
            position: 1,
            youtube_url: "https://www.youtube.com/watch?v=aircAruvnKk",
            body_md: `# Tensores en PyTorch

PyTorch combina la agilidad de NumPy con aceleración por hardware (CUDA / Metal MPS).

\`\`\`python
import torch

device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
x = torch.randn(3, 3, requires_grad=True, device=device)
y = x ** 2 + 2 * x + 1
y.backward(torch.ones_like(x))
print(x.grad)
\`\`\`
`,
          },
          {
            title: "Construcción y Entrenamiento de un Perceptrón Multicapa (MLP)",
            position: 2,
            youtube_url: "https://www.youtube.com/watch?v=IHZwWFHWa-w",
            body_md: `# Ciclo de Entrenamiento en PyTorch

Los 5 pasos fundamentales del loop de entrenamiento:
1. ` + "`optimizer.zero_grad()`" + `
2. Forward pass: ` + "`outputs = model(inputs)`" + `
3. Loss calculation: ` + "`loss = criterion(outputs, targets)`" + `
4. Backward pass: ` + "`loss.backward()`" + `
5. Parameter update: ` + "`optimizer.step()`" + `
`,
          },
        ],
      },
      {
        title: "Módulo 2: Transformers y Mecanismos de Atención",
        position: 2,
        lessons: [
          {
            title: "Arquitectura Multi-Head Attention Explicada",
            position: 1,
            youtube_url: "https://www.youtube.com/watch?v=mMa2PmYJlCo",
            body_md: `# Mecanismo de Auto-Atención

La fórmula que cambió la IA moderna:
$$Attention(Q, K, V) = softmax(\\frac{QK^T}{\\sqrt{d_k}})V$$

Permite a la red sopesar dinámicamente qué palabras del contexto son cruciales para cada token.
`,
          },
        ],
      },
    ],
  },
  {
    title: "Ingeniería de Datos Moderna con dbt y Snowflake",
    slug: "ingenieria-de-datos-moderna-con-dbt-y-snowflake",
    description:
      "Aprende el paradigma ELT contemporáneo: modelado dimensional, pruebas automatizadas de datos, documentación interactiva y orquestación eficiente en la nube.",
    cover_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    price: 39.99,
    modules: [
      {
        title: "Módulo 1: Arquitectura de Almacenamiento en Snowflake",
        position: 1,
        lessons: [
          {
            title: "Data Warehousing en Snowflake y Gestión de Virtual Warehouses",
            position: 1,
            youtube_url: "https://www.youtube.com/watch?v=yUSgOhyT2i8",
            body_md: `# Fundamentos de Snowflake

Snowflake separa almacenamiento y cómputo de manera elástica e independiente:
- **Storage Layer**: Micro-particionamiento automático y compresión columnar.
- **Compute Layer**: Virtual Warehouses escalables en segundos.
- **Cloud Services**: Seguridad, metadatos y optimización de consultas.
`,
          },
        ],
      },
      {
        title: "Módulo 2: Modelado y Pruebas con dbt Core",
        position: 2,
        lessons: [
          {
            title: "Creación de Modelos Staging, Marts y Tests de Integridad",
            position: 1,
            youtube_url: "https://www.youtube.com/watch?v=1r_B4eIqR1o",
            body_md: `# Modelado con dbt

Transforma datos usando simple SQL combinado con plantillas Jinja y dependencias ` + "`{{ ref('...') }}`" + `.

\`\`\`sql
-- models/marts/fct_course_enrollments.sql
with enrollments as (
    select * from {{ ref('stg_enrollments') }}
),
courses as (
    select * from {{ ref('stg_courses') }}
)
select
    e.id as enrollment_id,
    e.user_id,
    c.title as course_title,
    c.price,
    e.enrolled_at
from enrollments e
join courses c on e.course_id = c.id
\`\`\`
`,
          },
        ],
      },
    ],
  },
  {
    title: "Desarrollo Fullstack con Next.js 15 y Supabase",
    slug: "desarrollo-fullstack-con-nextjs-15-y-supabase",
    description:
      "Construye aplicaciones web de alto rendimiento y grado de producción. Domina React Server Components, Server Actions, Autenticación SSR y Row Level Security (RLS) en PostgreSQL.",
    cover_url:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    price: 34.99,
    modules: [
      {
        title: "Módulo 1: Next.js 15 App Router y Server Actions",
        position: 1,
        lessons: [
          {
            title: "React Server Components y Flujo de Datos Híbrido",
            position: 1,
            youtube_url: "https://www.youtube.com/watch?v=0sOvCWFmrtA",
            body_md: `# Next.js 15 App Router

Ventajas de renderizar en el servidor:
- Cero JavaScript del lado del cliente para componentes de solo presentación.
- Acceso directo y seguro a bases de datos y secretos sin exponer endpoints API innecesarios.
- Streaming y Suspense automáticos para cargas ultrarrápidas de UI.
`,
          },
          {
            title: "Server Actions y Mutaciones Seguras de Estado",
            position: 2,
            youtube_url: "https://www.youtube.com/watch?v=dDpZfOQBMaU",
            body_md: `# Server Actions

Ejecuta lógica en el servidor directamente desde formularios o llamadas en cliente:

\`\`\`typescript
"use server";
import { revalidatePath } from "next/cache";

export async function createCourseAction(formData: FormData) {
  const title = formData.get("title");
  // Lógica segura en servidor
  revalidatePath("/dashboard/teaching");
}
\`\`\`
`,
          },
        ],
      },
      {
        title: "Módulo 2: Supabase SSR y Políticas Row Level Security",
        position: 2,
        lessons: [
          {
            title: "Seguridad Robusta con Políticas Postgres RLS",
            position: 1,
            youtube_url: "https://www.youtube.com/watch?v=Ow_Uzedfohk",
            body_md: `# Row Level Security (RLS)

Nunca confíes en filtros aplicados solo en el frontend. La seguridad pertenece a la base de datos:

\`\`\`sql
CREATE POLICY "users access their own enrollments"
ON public.enrollments FOR SELECT
USING (user_id = auth.uid());
\`\`\`
`,
          },
        ],
      },
    ],
  },
  {
    title: "Agentes de Inteligencia Artificial con LangGraph y CrewAI",
    slug: "agentes-de-inteligencia-artificial-con-langgraph-y-crewai",
    description:
      "Diseña sistemas multi-agente autónomos, grafos de estado cíclicos, memoria distribuida y ejecución controlada de herramientas con LangGraph y CrewAI.",
    cover_url:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    price: 44.99,
    modules: [
      {
        title: "Módulo 1: Fundamentos de Agentes y Patrones de Ejecución",
        position: 1,
        lessons: [
          {
            title: "Patrón ReAct: Razonamiento, Acción y Reflexión",
            position: 1,
            youtube_url: "https://www.youtube.com/watch?v=sal78ACtGTc",
            body_md: `# Paradigma de Agentes Autónomos

Un agente es un LLM equipado con:
1. **Herramientas (Tools)**: Calculadoras, APIs web, búsquedas en bases de datos.
2. **Memoria**: Contexto a corto y largo plazo.
3. **Planificación**: Descomposición de metas complejas en sub-tareas ejecutables.
`,
          },
        ],
      },
      {
        title: "Módulo 2: Grafos de Estado con LangGraph",
        position: 2,
        lessons: [
          {
            title: "Nodos, Aristas Condicionales y Human-in-the-Loop",
            position: 1,
            youtube_url: "https://www.youtube.com/watch?v=hvAPnpSfSGo",
            body_md: `# Flujos con LangGraph

A diferencia de cadenas lineales DAG, LangGraph permite ciclos y puntos de control (checkpoints) para intervención humana antes de ejecutar acciones críticas.
`,
          },
        ],
      },
    ],
  },
];

async function seed() {
  console.log("=== INICIANDO SEED DE DATOS EN SUPABASE ===");

  // 1. Crear / Asegurar 2 tipos de usuarios
  // Tipo 1: Docente / Instructor (crea y publica cursos)
  const instructorUser = await getOrCreateUser(
    "instructor@datapath.ai",
    "Password123!",
    {
      role: "instructor",
      user_type: "Docente / Creador",
      display_name: "Prof. Carlos Mendoza",
    },
    {
      display_name: "Prof. Carlos Mendoza",
      bio: "Lead Data Scientist & Docente Senior en IA, Embeddings y Arquitecturas RAG.",
      avatar_url:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    }
  );

  // Tipo 2: Alumno / Estudiante (se inscribe y aprende)
  const studentUser = await getOrCreateUser(
    "estudiante@datapath.ai",
    "Password123!",
    {
      role: "student",
      user_type: "Estudiante / Aprendiz",
      display_name: "Ana Gómez",
    },
    {
      display_name: "Ana Gómez",
      bio: "Estudiante de Ciencia de Datos y Desarrollo Web. Apasionada por el Machine Learning.",
      avatar_url:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    }
  );

  console.log("\n=== INSERTANDO LOS 5 CURSOS ===");
  const createdCourses = [];

  for (const courseData of COURSES_DATA) {
    // Check if course exists by slug
    const { data: existingCourse } = await supabase
      .from("courses")
      .select("id, slug")
      .eq("slug", courseData.slug)
      .maybeSingle();

    let courseId;
    if (existingCourse) {
      console.log(`Actualizando curso: ${courseData.title} (${courseData.slug})`);
      courseId = existingCourse.id;
      await supabase
        .from("courses")
        .update({
          owner_id: instructorUser.id,
          title: courseData.title,
          description: courseData.description,
          cover_url: courseData.cover_url,
          status: courseData.status,
          price: courseData.price,
          updated_at: new Date().toISOString(),
        })
        .eq("id", courseId);
    } else {
      console.log(`Creando curso: ${courseData.title} (${courseData.slug})`);
      const { data: newCourse, error: cErr } = await supabase
        .from("courses")
        .insert({
          owner_id: instructorUser.id,
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description,
          cover_url: courseData.cover_url,
          status: courseData.status,
          price: courseData.price,
        })
        .select("id")
        .single();

      if (cErr) {
        console.error(`Error al crear curso ${courseData.title}:`, cErr);
        throw cErr;
      }
      courseId = newCourse.id;
    }

    createdCourses.push({ id: courseId, title: courseData.title, slug: courseData.slug });

    // Modulos y lecciones
    for (const modData of courseData.modules) {
      let { data: mod } = await supabase
        .from("modules")
        .select("id")
        .eq("course_id", courseId)
        .eq("title", modData.title)
        .maybeSingle();

      if (!mod) {
        const { data: newMod, error: mErr } = await supabase
          .from("modules")
          .insert({
            course_id: courseId,
            title: modData.title,
            position: modData.position,
          })
          .select("id")
          .single();
        if (mErr) throw mErr;
        mod = newMod;
      }

      for (const lesData of modData.lessons) {
        let { data: les } = await supabase
          .from("lessons")
          .select("id")
          .eq("module_id", mod.id)
          .eq("title", lesData.title)
          .maybeSingle();

        if (!les) {
          const { data: newLes, error: lErr } = await supabase
            .from("lessons")
            .insert({
              module_id: mod.id,
              title: lesData.title,
              position: lesData.position,
            })
            .select("id")
            .single();
          if (lErr) throw lErr;
          les = newLes;
        }

        // Lesson contents
        await supabase
          .from("lesson_contents")
          .upsert({
            lesson_id: les.id,
            body_md: lesData.body_md,
            youtube_url: lesData.youtube_url,
            updated_at: new Date().toISOString(),
          });
      }
    }
  }

  console.log("\n=== INSCRIBIENDO AL ESTUDIANTE Y GENERANDO RESEÑAS ===");
  // Inscribir a la estudiante en 3 de los cursos
  const enrolledCourseIndices = [0, 1, 3];
  for (const idx of enrolledCourseIndices) {
    const course = createdCourses[idx];
    const { error: eErr } = await supabase
      .from("enrollments")
      .upsert(
        {
          user_id: studentUser.id,
          course_id: course.id,
          status: "active",
          enrolled_at: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
        },
        { onConflict: "user_id,course_id" }
      );

    if (eErr) console.error(`Error al inscribir a estudiante en ${course.title}:`, eErr);
    else console.log(`✓ Estudiante inscrita en: ${course.title}`);
  }

  // Reseñas de la estudiante
  const reviewsData = [
    {
      courseIndex: 0,
      rating: 5,
      body: "¡Excelente contenido! La explicación de embeddings vectoriales y pgvector fue muy clara y práctica para mi proyecto.",
    },
    {
      courseIndex: 1,
      rating: 5,
      body: "El mejor curso de PyTorch en español. Los ejemplos prácticos de tensores y transformers son top.",
    },
    {
      courseIndex: 3,
      rating: 4,
      body: "Muy buena integración entre Next.js 15 y Supabase RLS. Me ahorró semanas de dudas con la seguridad.",
    },
  ];

  for (const rev of reviewsData) {
    const course = createdCourses[rev.courseIndex];
    const { error: rErr } = await supabase
      .from("reviews")
      .upsert(
        {
          user_id: studentUser.id,
          course_id: course.id,
          rating: rev.rating,
          body: rev.body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_id" }
      );

    if (rErr) console.error(`Error al agregar review para ${course.title}:`, rErr);
    else console.log(`✓ Reseña registrada para: ${course.title} (${rev.rating}⭐)`);
  }

  console.log("\n========================================================");
  console.log("¡SEED COMPLETADO CON ÉXITO!");
  console.log("========================================================");
  console.log("USUARIOS CREADOS (2 TIPOS):");
  console.log("1. Tipo Instructor:");
  console.log("   - Email: instructor@datapath.ai");
  console.log("   - Password: Password123!");
  console.log("   - Nombre: Prof. Carlos Mendoza");
  console.log("   - Rol / Rol implícito: Instructor (dueño de los 5 cursos)");
  console.log("");
  console.log("2. Tipo Estudiante:");
  console.log("   - Email: estudiante@datapath.ai");
  console.log("   - Password: Password123!");
  console.log("   - Nombre: Ana Gómez");
  console.log("   - Rol / Rol implícito: Estudiante (inscrita en 3 cursos, con reviews y avance)");
  console.log("========================================================");
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
