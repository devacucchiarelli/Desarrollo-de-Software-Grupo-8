  import { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import '../styles/css/estadisticas.css';

  function Estadisticas() {
    const [torneos, setTorneos] = useState([]);
    const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const partidosPorPagina = 10;
    const navigate = useNavigate();

    useEffect(() => {
      cargarTorneos();
    }, []);

    const cargarTorneos = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/estadisticas/torneos", {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al cargar torneos');
        const data = await response.json();
        setTorneos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const cargarEstadisticasTorneo = async (idTorneo) => {
      try {
        setLoading(true);
        setPaginaActual(1);
        const response = await fetch(`http://localhost:3000/api/estadisticas/torneo/${idTorneo}`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al cargar estadísticas');
        const data = await response.json();
        setEstadisticas(data);
        setTorneoSeleccionado(idTorneo);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const volverALista = () => {
      setTorneoSeleccionado(null);
      setEstadisticas(null);
      setPaginaActual(1);
    };

    // Paginación
    const indiceUltimo = paginaActual * partidosPorPagina;
    const indicePrimero = indiceUltimo - partidosPorPagina;
    const partidosActuales = estadisticas?.partidos.slice(indicePrimero, indiceUltimo) || [];
    const totalPaginas = estadisticas ? Math.ceil(estadisticas.partidos.length / partidosPorPagina) : 0;

    if (loading && torneos.length === 0) {
      return (
        <div className="estadisticas-container">
          <div className="loading-spinner">Cargando...</div>
        </div>
      );
    }

    if (error && !torneoSeleccionado) {
      return (
        <div className="estadisticas-container">
          <button onClick={() => navigate('/')} className="btn-volver">← Volver</button>
          <div className="mensaje-error">Error: {error}</div>
        </div>
      );
    }

    // Lista de torneos
    if (!torneoSeleccionado) {
      return (
        <div className="estadisticas-container">
          <button onClick={() => navigate('/')} className="btn-volver">← Volver</button>
          <h2>Estadísticas por Torneo</h2>

          {torneos.length === 0 ? (
            <div className="mensaje-vacio">No hay torneos con partidos jugados</div>
          ) : (
            <div className="torneos-grid">
              {torneos.map((torneo) => (
                <div key={torneo.id_torneo} className="torneo-card" onClick={() => cargarEstadisticasTorneo(torneo.id_torneo)}>
                  <h3>{torneo.nombre_torneo}</h3>
                  <div className="torneo-info">
                    <span>Tipo: {torneo.tipo_torneo}</span>
                    <span>Formato: {torneo.formato}</span>
                    <span>Partidos: {torneo.partidos_jugados}</span>
                  </div>
                  <button className="btn-ver-stats">Ver Estadísticas</button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Estadísticas del torneo
    if (loading) {
      return (
        <div className="estadisticas-container">
          <button onClick={volverALista} className="btn-volver">← Volver</button>
          <div className="loading-spinner">Cargando estadísticas...</div>
        </div>
      );
    }

    if (!estadisticas) {
      return (
        <div className="estadisticas-container">
          <button onClick={volverALista} className="btn-volver">← Volver</button>
          <div className="mensaje-error">No se pudieron cargar las estadísticas</div>
        </div>
      );
    }

    return (
      <div className="estadisticas-container">
        <button onClick={volverALista} className="btn-volver">← Volver a Torneos</button>

        <h2>{estadisticas.torneo.nombre_torneo}</h2>

        {/* CONTENEDOR HORIZONTAL: GOLEADORES A LA IZQUIERDA, PARTIDOS A LA DERECHA */}
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
                            <span className="text-black font-bold">{p.equipo_local}</span>
                            <span className="score">{p.resultado_local}</span>
                          </div>
                          <div className="equipo">
                            <span className="text-black font-bold">{p.equipo_visitante}</span>
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

  export default Estadisticas;