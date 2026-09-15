# 🎓 Course Platform

Una plataforma de cursos en línea construida con **Next.js 15**, **React 19**, **TypeScript** y **Supabase**. Permite a los instructores crear y publicar cursos con módulos, lecciones y contenido multimedia; y a los estudiantes inscribirse, ver el contenido y dejar reseñas.

---

## ✨ Características principales

- **Catálogo de cursos** — Vista pública con cursos publicados, portadas, autor y calificación promedio.
- **Autenticación** — Registro e inicio de sesión gestionados por Supabase Auth (email/contraseña).
- **Roles implícitos** — Cualquier usuario autenticado puede ser instructor (crea cursos) o estudiante (se inscribe).
- **Creación de cursos** — Editor completo: título, slug, descripción, portada, precio y estado (borrador / publicado).
- **Módulos y lecciones** — Estructura jerárquica: curso → módulos → lecciones con posición ordenable.
- **Contenido de lecciones** — Soporte para Markdown (`react-markdown`) y videos de YouTube embebidos.
- **Inscripciones** — Los estudiantes se inscriben con un click; el contenido queda desbloqueado tras la inscripción.
- **Reseñas y calificaciones** — Sistema de estrellas (1–5) con comentario; vista agregada `course_ratings`.
- **Perfil de usuario** — Nombre visible y bio editable.
- **Row Level Security (RLS)** — Todas las tablas protegidas a nivel de base de datos.
- **Middleware de sesión** — Refresca el token de Supabase en cada petición vía Next.js Middleware.

---

## 🗂️ Estructura del proyecto

```
.
├── app/                        # App Router de Next.js
│   ├── page.tsx                # Catálogo público de cursos
│   ├── layout.tsx              # Layout raíz
│   ├── globals.css             # Estilos globales
│   ├── login/                  # Página de inicio de sesión
│   ├── register/               # Página de registro
│   ├── dashboard/              # Panel del instructor
│   ├── courses/[slug]/         # Detalle de un curso
│   └── api/                    # Route Handlers
├── components/                 # Componentes React reutilizables
│   ├── CourseEditor.tsx
│   ├── ModuleEditor.tsx
│   ├── LessonEditor.tsx
│   ├── EnrollButton.tsx
│   ├── ReviewForm.tsx
│   ├── ReviewList.tsx
│   ├── RatingBadge.tsx
│   ├── ProfileForm.tsx
│   ├── SiteHeader.tsx
│   └── SignOutButton.tsx
├── lib/
│   ├── supabase/               # Clientes Supabase (server, client, middleware)
│   ├── database.types.ts       # Tipos TypeScript del esquema
│   ├── env.ts                  # Validación de variables de entorno
│   ├── slug.ts                 # Helper de slugs
│   └── youtube.ts              # Helper de YouTube
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql       # Esquema inicial
│       ├── 0002_rls.sql        # Políticas RLS
│       └── 0003_policy_tests.sql
├── middleware.ts               # Refresco de sesión
├── .env.local.example          # Plantilla de variables de entorno
└── package.json
```

---

## 🗄️ Esquema de base de datos

| Tabla / Vista       | Descripción                                                                    |
|---------------------|--------------------------------------------------------------------------------|
| `profiles`          | Perfil 1:1 con `auth.users`; creado automáticamente al registrar un usuario.   |
| `courses`           | Cursos con título, slug único, descripción, portada, precio y estado.          |
| `modules`           | Módulos ordenados que pertenecen a un curso.                                   |
| `lessons`           | Lecciones ordenadas dentro de un módulo.                                       |
| `lesson_contents`   | Contenido (Markdown + YouTube), protegido por inscripción.                     |
| `enrollments`       | Relación alumno ↔ curso; única por `(user_id, course_id)`.                    |
| `reviews`           | Reseña con calificación (1–5) y texto; única por `(user_id, course_id)`.       |
| `course_ratings`    | Vista agregada: promedio y conteo de reseñas por curso.                        |

---

## 🚀 Puesta en marcha

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18+
- Cuenta y proyecto en [Supabase](https://supabase.com/)

### 1. Clonar e instalar

```bash
git clone <url-del-repositorio>
cd "sesion 4"
npm install
```

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>   # opcional
```

> ⚠️ **Nunca** expongas `SUPABASE_SERVICE_ROLE_KEY` en el cliente.

### 3. Migraciones

Ejecuta los archivos de `supabase/migrations/` en orden desde el SQL Editor de Supabase o con la CLI:

```bash
supabase db push
```

### 4. Servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## 📜 Scripts

| Comando           | Descripción                            |
|-------------------|----------------------------------------|
| `npm run dev`     | Servidor de desarrollo con hot-reload  |
| `npm run build`   | Bundle de producción                   |
| `npm start`       | Sirve el bundle de producción          |
| `npm run lint`    | Análisis estático con ESLint           |

---

## 🛡️ Seguridad (RLS)

Todas las tablas tienen **Row Level Security** habilitado:

- **Cursos**: solo el propietario puede crear/editar; cualquiera ve los publicados.
- **Contenido de lecciones**: visible solo para el propietario o estudiantes inscritos.
- **Inscripciones**: cada usuario gestiona las suyas.
- **Reseñas**: cada usuario gestiona la suya; todos leen las de cursos publicados.
- **Perfiles**: cada usuario edita el suyo; todos leen los perfiles.

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| [Next.js 15](https://nextjs.org/) | Framework React con App Router y Server Components |
| [React 19](https://react.dev/) | UI con Server & Client Components |
| [TypeScript 5](https://www.typescriptlang.org/) | Tipado estático |
| [Supabase](https://supabase.com/) | PostgreSQL, Auth y Storage |
| [`@supabase/ssr`](https://supabase.com/docs/guides/auth/server-side/nextjs) | Integración SSR con Next.js |
| [`react-markdown`](https://github.com/remarkjs/react-markdown) | Renderizado de Markdown |
| [ESLint](https://eslint.org/) | Análisis estático de código |

---

## 📄 Licencia

Este proyecto es de uso educativo — licencia [MIT](LICENSE).
