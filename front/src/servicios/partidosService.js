
// src/servicios/partidosService.js
const BASE_URL = 'http://localhost:3000';

// 🏆 Obtener todos los partidos de un torneo
export async function getPartidosPorTorneo(idTorneo) {
  const res = await fetch(`${BASE_URL}/partidos/${idTorneo}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'No se pudo obtener el fixture');
  }
  return await res.json();
}

// ✏️ Actualizar un partido (resultado, fecha, jugadores, etc.)
export async function updatePartido(idPartido, data) {
  const res = await fetch(`${BASE_URL}/partidos/${idPartido}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(result.error || `Error ${res.status}: No se pudo guardar`);
  }
  return result;
}

// 📊 Obtener tabla de posiciones
export async function getTablaPosiciones(idTorneo) {
  const res = await fetch(`${BASE_URL}/tabla/${idTorneo}`, {
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'No se pudo obtener la tabla');
  }
  return data;
}

// 🧾 Actualizar nombre de equipo desde la tabla
export async function updateNombreEquipo(idEquipo, nuevoNombre) {
  const res = await fetch(`${BASE_URL}/tabla/equipo/${idEquipo}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nuevo_nombre: nuevoNombre.trim() }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}
