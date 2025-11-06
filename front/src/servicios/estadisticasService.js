

const API = "http://localhost:3000/estadisticas";

export async function getEstadisticas(idTorneo) {
  const r = await fetch(`${API}/${idTorneo}`); // GET público
  if (!r.ok) throw new Error("GET stats " + r.status);
  return r.json();
}

export async function putEstadisticas(idTorneo) {
  const r = await fetch(`${API}/${idTorneo}`, {
    method: "PUT",
    credentials: "include", // protegido por cookie (tu middleware)
  });
  if (!r.ok) throw new Error("PUT stats " + r.status);
  return r.json();
}
