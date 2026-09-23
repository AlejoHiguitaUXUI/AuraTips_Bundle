"""Herramientas compartidas para el asistente Edy.

Este módulo define las funciones de herramienta que son utilizadas tanto por
el canal de texto (api/main.py vía Gemini) como por el canal de voz
(voice/main.py vía LiveKit).

La función cruda (async) vive aquí sin decoradores de framework. Cada canal
aplica su propio wrapper al importarla.
"""

import os
import httpx

PLATFORM_URL = os.getenv("PLATFORM_URL", "http://localhost:3000")


async def search_courses(query: str) -> dict:
    """Busca procedimientos médicos y estéticos, cuidados y protocolos en el catálogo de AuraTips y AuraMed por similitud semántica.

    Args:
        query: Término de búsqueda, tratamiento estético, zona anatómica o inquietud (ej. toxina botulínica, relleno de labios, rinomodelación, etc.).
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                f"{PLATFORM_URL}/api/courses/search", params={"q": query}
            )
            response.raise_for_status()
            return response.json()
        except httpx.ConnectError:
            return {
                "error": (
                    f"No se pudo conectar con el servicio de catálogo de Edu_platform_OS en {PLATFORM_URL}. "
                    "El servicio puede estar temporalmente fuera de línea."
                )
            }
        except httpx.TimeoutException:
            return {
                "error": "El servicio de catálogo de cursos tardó demasiado tiempo en responder (timeout de 10s)."
            }
        except httpx.HTTPStatusError as exc:
            return {
                "error": f"El servicio de cursos retornó código de error {exc.response.status_code}: {exc.response.text}"
            }
        except Exception as exc:
            return {
                "error": f"Error inesperado al consultar catálogo: {str(exc)}"
            }


# ---------------------------------------------------------------------------
# LiveKit wrapper (solo se usa desde voice/main.py)
# Se importa condicionalmente para que api/main.py no dependa de livekit.
# ---------------------------------------------------------------------------
try:
    from livekit.agents import function_tool

    search_courses_livekit = function_tool(search_courses)
    TOOLS_LIVEKIT = [search_courses_livekit]
except ImportError:
    search_courses_livekit = None
    TOOLS_LIVEKIT = []
