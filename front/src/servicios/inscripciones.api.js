
// front/src/servicios/inscripciones.api.js
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function crearInscripcion(payload) {
  const res = await fetch(`${API}/api/v1/inscripciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "No se pudo inscribir");
  }
  // si el backend no devuelve JSON, evitamos error
  try { return await res.json(); } catch { return {}; }
}
