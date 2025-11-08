import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../styles/css/estadisticasTorneo.css';

function EstadisticasTorneo() {
  const { id_torneo } = useParams();
  const [estadisticas, setEstadisticas] = useState(null);
  const [resumenStats, setResumenStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const partidosPorPagina = 10;
  const navigate = useNavigate();

  useEffect(() => {
    cargarEstadisticasTorneo();
  }, [id_torneo]);

  const cargarEstadisticasTorneo = async () => {
    try {
      setLoading(true);
      setPaginaActual(1);
      
      // Cargar estadísticas completas
      const response = await fetch(`http://localhost:3000/api/estadisticas/torneo/${id_torneo}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar estadísticas');
      const data = await response.json();
      setEstadisticas(data);
      
      // Cargar resumen de estadísticas
      const resumenResponse = await fetch(`http://localhost:3000/api/estadisticas/torneo/${id_torneo}/resumen`, {
        credentials: 'include'
      });
      if (resumenResponse.ok) {
        const resumenData = await resumenResponse.json();
        setResumenStats(resumenData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Paginación
  const indiceUltimo = paginaActual * partidosPorPagina;
  const indicePrimero = indiceUltimo - partidosPorPagina;
  const partidosActuales = estadisticas?.partidos.slice(indicePrimero, indiceUltimo) || [];
  const totalPaginas = estadisticas ? Math.ceil(estadisticas.partidos.length / partidosPorPagina) : 0;

  if (loading) {
    return (
      <div className="estadisticas-torneo-container">
        <button onClick={() => navigate('/torneos')} className="btn-volver">← Volver a Torneos</button>
        <div className="loading-spinner">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error || !estadisticas) {
    return (
      <div className="estadisticas-torneo-container">
        <button onClick={() => navigate('/torneos')} className="btn-volver">← Volver a Torneos</button>
        <div className="mensaje-error">{error || 'No se pudieron cargar las estadísticas'}</div>
      </div>
    );
  }

  return (
    <div className="estadisticas-torneo-container">
      <button onClick={() => navigate('/torneos')} className="btn-volver">← Volver a Torneos</button>

      <h2>{estadisticas.torneo.nombre_torneo}</h2>

      {/* RESUMEN DE ESTADÍSTICAS */}
      {resumenStats && (
        <div className="resumen-estadisticas">
          <h3>📊 Resumen del Torneo</h3>
          <div className="stats-grid">
            {resumenStats.goleador && (
              <div className="stat-card">
                <div className="stat-label">🏆 Goleador</div>
                <div className="stat-value">{resumenStats.goleador.nombre || resumenStats.goleador.email}</div>
                <div className="stat-detail">{resumenStats.goleador.total_goles} goles</div>
              </div>
            )}
            
            {resumenStats.equipoMasAmarillas && (
              <div className="stat-card amarillas">
                <div className="stat-label">🟨 Más Amarillas</div>
                <div className="stat-value">{resumenStats.equipoMasAmarillas.equipo}</div>
                <div className="stat-detail">{resumenStats.equipoMasAmarillas.total_amarillas} tarjetas</div>
              </div>
            )}
            
            {resumenStats.equipoMasRojas && (
              <div className="stat-card rojas">
                <div className="stat-label">🟥 Más Rojas</div>
                <div className="stat-value">{resumenStats.equipoMasRojas.equipo}</div>
                <div className="stat-detail">{resumenStats.equipoMasRojas.total_rojas} tarjetas</div>
              </div>
            )}
            
            {resumenStats.partidoMasGoles && (
              <div className="stat-card goles">
                <div className="stat-label">⚽ Partido con más goles</div>
                <div className="stat-value">
                  {resumenStats.partidoMasGoles.equipo_local} vs {resumenStats.partidoMasGoles.equipo_visitante}
                </div>
                <div className="stat-detail">
                  {resumenStats.partidoMasGoles.resultado_local}-{resumenStats.partidoMasGoles.resultado_visitante} 
                  ({resumenStats.partidoMasGoles.total_goles} goles)
                </div>
              </div>
            )}

            {resumenStats.estadisticasGenerales && (
              <>
                <div className="stat-card general">
                  <div className="stat-label">📈 Promedio Goles/Partido</div>
                  <div className="stat-value">{resumenStats.estadisticasGenerales.promedio_goles_partido || 0}</div>
                  <div className="stat-detail">Total: {resumenStats.estadisticasGenerales.total_goles || 0} goles</div>
                </div>

                <div className="stat-card general">
                  <div className="stat-label">🎯 Total Partidos</div>
                  <div className="stat-value">{resumenStats.estadisticasGenerales.total_partidos || 0}</div>
                  <div className="stat-detail">
                    {resumenStats.estadisticasGenerales.total_amarillas || 0} 🟨 / {resumenStats.estadisticasGenerales.total_rojas || 0} 🟥
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONTENEDOR HORIZONTAL: GOLEADORES + PARTIDOS */}
      <div className="contenedor-horizontal">

        {/* GOLEADORES (COLUMNA IZQUIERDA) */}
        {estadisticas.tablaGoleadores.length > 0 && (
          <div className="seccion-stats seccion-goleadores">
            <h3>🏆 Goleadores</h3>
            <table className="tabla-goleadores">
              <thead>
                <tr>
                  <th className="posicion">#</th>
                  <th>Jugador</th>
                  <th className="goles">Goles</th>
                </tr>
              </thead>
              <tbody>
                {estadisticas.tablaGoleadores.map((g, i) => (
                  <tr key={g.id_usuario}>
                    <td className="posicion">{i + 1}</td>
                    <td>{g.nombre || g.email}</td>
                    <td className="goles">{g.total_goles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PARTIDOS (COLUMNA DERECHA) */}
        <div className="seccion-stats seccion-partidos">
          <h3>⚽ Partidos ({estadisticas.partidos.length})</h3>
          {estadisticas.partidos.length === 0 ? (
            <div className="mensaje-vacio">No hay partidos jugados</div>
          ) : (
            <>
              <div className="partidos-list">
                {partidosActuales.map((p) => (
                  <div key={p.id_partido} className="partido-detalle">
                    <div className="partido-header">
                      <div className="fecha">
                        {new Date(p.fecha_partido).toLocaleDateString('es-AR')}
                      </div>
                      <div className="resultado">
                        <div className="equipo">
                          <span className="equipo-nombre">{p.equipo_local}</span>
                          <span className="score">{p.resultado_local}</span>
                        </div>
                        <div className="equipo">
                          <span className="equipo-nombre">{p.equipo_visitante}</span>
                          <span className="score">{p.resultado_visitante}</span>
                        </div>
                      </div>
                    </div>

                    {p.jugadores.length > 0 && (
                      <div className="partido-jugadores">
                        <h4>Estadísticas:</h4>
                        <div className="jugadores-grid">
                          {p.jugadores.map((j) => (
                            <div key={j.id_jugador} className="jugador-stat">
                              <span>{j.nombre_jugador || j.email_jugador}</span>
                              <div className="jugador-numeros">
                                {j.goles > 0 && <span className="stat-badge goles">⚽ {j.goles}</span>}
                                {j.amarillas > 0 && <span className="stat-badge amarilla">🟨</span>}
                                {j.rojas > 0 && <span className="stat-badge roja">🟥</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="paginacion">
                  <button
                    className="btn-pagina"
                    onClick={() => setPaginaActual(paginaActual - 1)}
                    disabled={paginaActual === 1}
                  >
                    ← Anterior
                  </button>

                  <span className="paginacion-info">
                    Página {paginaActual} de {totalPaginas}
                  </span>

                  <button
                    className="btn-pagina"
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EstadisticasTorneo;