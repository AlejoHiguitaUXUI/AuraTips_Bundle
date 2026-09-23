"""Servidor Mock de Edu_platform_OS para pruebas locales de integración con EDY.

Permite probar el flujo completo de function calling de EDY sin necesidad de tener
levantada la base de datos o el backend real de la plataforma.

Ejecución:
    python mock_platform.py
    # Se ejecuta en http://localhost:3000
"""

from fastapi import FastAPI, Query
import uvicorn

app = FastAPI(title="Edu_platform_OS Mock API")

MOCK_COURSES = [
    {
        "id": "ml-101",
        "title": "Machine Learning para Data Science",
        "description": "Aprende algoritmos supervisados y no supervisados, validación cruzada y Scikit-Learn desde fundamentos matemáticos hasta despliegue.",
        "price": 49.99,
        "currency": "USD",
        "instructor": "Dra. Elena Ramos",
        "rating": 4.9,
        "level": "Intermedio",
        "url": "https://datapath.ai/cursos/machine-learning",
    },
    {
        "id": "py-201",
        "title": "Python Avanzado y Arquitectura de Software",
        "description": "Profundiza en concurrencia, asyncio, metaprogramación, patrones de diseño y desarrollo de APIs asíncronas con FastAPI.",
        "price": 39.99,
        "currency": "USD",
        "instructor": "Ing. Carlos Mendoza",
        "rating": 4.8,
        "level": "Avanzado",
        "url": "https://datapath.ai/cursos/python-avanzado",
    },
    {
        "id": "de-301",
        "title": "Data Engineering con Spark y Kafka",
        "description": "Construcción de pipelines de datos en streaming y batch utilizando Apache Spark, Delta Lake y Apache Kafka en la nube.",
        "price": 59.99,
        "currency": "USD",
        "instructor": "Ing. Sofía Valenzuela",
        "rating": 4.95,
        "level": "Avanzado",
        "url": "https://datapath.ai/cursos/data-engineering",
    },
    {
        "id": "genai-401",
        "title": "Agentes de Inteligencia Artificial y RAG",
        "description": "Desarrollo de agentes autónomos, frameworks LLM, bases de datos vectoriales y arquitecturas multimodales de voz y texto.",
        "price": 69.99,
        "currency": "USD",
        "instructor": "Dr. Mateo Fernández",
        "rating": 5.0,
        "level": "Especialización",
        "url": "https://datapath.ai/cursos/agentes-ia-rag",
    },
]


@app.get("/api/courses/search")
async def search_courses_endpoint(
    q: str = Query(..., description="Término o tema de búsqueda")
):
    query_lower = q.lower()
    matches = []
    for course in MOCK_COURSES:
        if (
            query_lower in course["title"].lower()
            or query_lower in course["description"].lower()
            or query_lower in course.get("level", "").lower()
        ):
            matches.append(course)

    # Si no hubo coincidencia estricta, devolvemos los más relevantes como fallback
    if not matches:
        matches = MOCK_COURSES[:3]

    return {"courses": matches, "query": q, "total": len(matches)}


@app.get("/health")
async def health():
    return {"status": "ok", "mock": True}


if __name__ == "__main__":
    print("Iniciando mock de Edu_platform_OS en http://localhost:3000...")
    uvicorn.run(app, host="127.0.0.1", port=3000)
