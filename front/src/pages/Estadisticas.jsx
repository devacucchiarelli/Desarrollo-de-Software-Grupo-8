import { useEffect, useState } from "react";

function Estadisticas() {
  const [partidos, setPartidos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/estadisticas/ultimos") // endpoint que creamos después
      .then((res) => res.json())
      .then((data) => setPartidos(data))
      .catch((err) => console.error("Error al obtener estadísticas:", err));
  }, []);

  return (
    <div className="estadisticas-container">
      <h2>Últimos partidos</h2>
      {partidos.length === 0 ? (
        <p>No hay estadísticas registradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Partido</th>
              <th>Resultado</th>
              <th>Goleador</th>
              <th>Amarillas</th>
              <th>Rojas</th>
            </tr>
          </thead>
          <tbody>
            {partidos.map((p) => (
              <tr key={p.id_partido}>
                <td>{p.fecha_partido}</td>
                <td>{p.equipo_local} vs {p.equipo_visitante}</td>
                <td>{p.resultado_local} - {p.resultado_visitante}</td>
                <td>{p.goleador || "-"}</td>
                <td>{p.amarillas || 0}</td>
                <td>{p.rojas || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Estadisticas;
