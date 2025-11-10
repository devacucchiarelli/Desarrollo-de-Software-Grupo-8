import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/css/tablaPosiciones.css";

// Modal de edición de partido - ADAPTADO DE FIXTURE
function EditMatchModal({ partido, onClose, onSave, isAdmin, idTorneo }) {
    const [equipos, setEquipos] = useState([]);
    const [jugadoresLocal, setJugadoresLocal] = useState([]);
    const [jugadoresVisitante, setJugadoresVisitante] = useState([]);
    const [estadisticasJugadores, setEstadisticasJugadores] = useState({});
    const [loading, setLoading] = useState(true);
    const canPlaySound = useRef(true);
    const audioRef = useRef(null);
    const canPlayRedCardSound = useRef(true);
    const audioRedCardRef = useRef(null);

    const [formData, setFormData] = useState({
        fecha_partido: partido.fecha_partido
            ? new Date(partido.fecha_partido).toISOString().slice(0, 16)
            : '',
        equipo_local: partido.id_equipo_local || '',
        equipo_visitante: partido.id_equipo_visitante || '',
        resultado_local: partido.resultado_local ?? partido.goles_local ?? 0,
        resultado_visitante: partido.resultado_visitante ?? partido.goles_visitante ?? 0,
    });

    useEffect(() => {
        const inicializar = async () => {
            await cargarEquipos();
            if (partido.id_equipo_local) {
                await cargarJugadores(partido.id_equipo_local, 'local');
            }
            if (partido.id_equipo_visitante) {
                await cargarJugadores(partido.id_equipo_visitante, 'visitante');
            }
            setLoading(false);
        };
        inicializar();
    }, []);

    useEffect(() => {
        if (formData.equipo_local && formData.equipo_local !== partido.id_equipo_local) {
            cargarJugadores(formData.equipo_local, 'local');
        }
    }, [formData.equipo_local]);

    useEffect(() => {
        if (formData.equipo_visitante && formData.equipo_visitante !== partido.id_equipo_visitante) {
            cargarJugadores(formData.equipo_visitante, 'visitante');
        }
    }, [formData.equipo_visitante]);

    const cargarEquipos = async () => {
        try {
            const responseInscripciones = await fetch('http://localhost:3000/inscripciones', {
                credentials: 'include'
            });

            if (!responseInscripciones.ok) return;

            const inscripciones = await responseInscripciones.json();
            const inscripcionesTorneo = inscripciones.filter(
                ins => {
                    const torneoId = ins.id_torneo || ins.torneoId;
                    return torneoId === parseInt(idTorneo);
                }
            );

            const idsEquiposInscritos = inscripcionesTorneo.map(
                ins => ins.id_equipo || ins.equipoId
            );

            if (idsEquiposInscritos.length === 0) {
                setEquipos([]);
                return;
            }

            const responseEquipos = await fetch('http://localhost:3000/equipos', {
                credentials: 'include'
            });

            if (responseEquipos.ok) {
                const todosEquipos = await responseEquipos.json();
                const equiposInscritos = todosEquipos.filter(
                    equipo => idsEquiposInscritos.includes(equipo.id_equipo)
                );
                setEquipos(equiposInscritos);
            }
        } catch (err) {
            console.error('Error al cargar equipos:', err);
        }
    };

    const cargarJugadores = async (idEquipo, tipo) => {
        try {
            const response = await fetch(`http://localhost:3000/equipos/jugadores/${idEquipo}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (tipo === 'local') {
                    setJugadoresLocal(data);
                } else {
                    setJugadoresVisitante(data);
                }
            }
        } catch (err) {
            console.error(`Error al cargar jugadores ${tipo}:`, err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value
        }));
    };

    const getPlayerKey = (idJugador, equipo) => `${equipo}_${idJugador}`;

    const toggleGol = (idJugador, equipo) => {
        const key = getPlayerKey(idJugador, equipo);
        setEstadisticasJugadores(prev => {
            const current = prev[key] || { id_usuario: idJugador, equipo, goles: 0, amarillas: 0, rojas: 0 };
            return {
                ...prev,
                [key]: { ...current, goles: current.goles + 1 }
            };
        });
    };

    const decrementarGol = (idJugador, equipo) => {
        const key = getPlayerKey(idJugador, equipo);
        setEstadisticasJugadores(prev => {
            const current = prev[key] || { id_usuario: idJugador, equipo, goles: 0, amarillas: 0, rojas: 0 };
            if (current.goles > 0) {
                return {
                    ...prev,
                    [key]: { ...current, goles: current.goles - 1 }
                };
            }
            return prev;
        });
    };

    const toggleAmarilla = (idJugador, equipo) => {
        const key = getPlayerKey(idJugador, equipo);
        setEstadisticasJugadores(prev => {
            const current = prev[key] || { id_usuario: idJugador, equipo, goles: 0, amarillas: 0, rojas: 0 };
            return {
                ...prev,
                [key]: { ...current, amarillas: current.amarillas === 0 ? 1 : 0 }
            };
        });
    };

    const toggleRoja = (idJugador, equipo) => {
        const key = getPlayerKey(idJugador, equipo);
        setEstadisticasJugadores(prev => {
            const current = prev[key] || { id_usuario: idJugador, equipo, goles: 0, amarillas: 0, rojas: 0 };
            return {
                ...prev,
                [key]: { ...current, rojas: current.rojas === 0 ? 1 : 0 }
            };
        });
    };

    const playGoalSound = () => {
        if (!canPlaySound.current) return;
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            canPlaySound.current = false;
            setTimeout(() => {
                canPlaySound.current = true;
            }, 300);
        }
    };

    const playRedCardSound = () => {
        if (!canPlayRedCardSound.current) return;
        if (audioRedCardRef.current) {
            audioRedCardRef.current.currentTime = 0;
            audioRedCardRef.current.play();
            canPlayRedCardSound.current = false;
            setTimeout(() => {
                canPlayRedCardSound.current = true;
            }, 300);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const equipoLocalSeleccionado = equipos.find(eq => eq.id_equipo === Number(formData.equipo_local));
        const equipoVisitanteSeleccionado = equipos.find(eq => eq.id_equipo === Number(formData.equipo_visitante));

        const goleadores = [];
        const amarillas = [];
        const rojas = [];

        Object.entries(estadisticasJugadores).forEach(([key, stats]) => {
            const idJugador = stats.id_usuario;
            if (stats.goles > 0) {
                for (let i = 0; i < stats.goles; i++) {
                    goleadores.push(idJugador);
                }
            }
            if (stats.amarillas > 0) amarillas.push(idJugador);
            if (stats.rojas > 0) rojas.push(idJugador);
        });

        const dataToSend = {
            fecha_partido: new Date(formData.fecha_partido).toISOString(),
            equipo_local: equipoLocalSeleccionado?.nombre_equipo || '',
            equipo_visitante: equipoVisitanteSeleccionado?.nombre_equipo || '',
            id_equipo_local: Number(formData.equipo_local),
            id_equipo_visitante: Number(formData.equipo_visitante),
            resultado_local: Number(formData.resultado_local),
            resultado_visitante: Number(formData.resultado_visitante),
            goleadores,
            amarillas,
            rojas,
        };

        onSave(partido.id_partido, dataToSend);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content-edit" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">
                    {isAdmin ? 'Editar' : 'Ver'} Partido
                    {partido.id_partido && ` #${partido.id_partido}`}
                </h3>

                <audio ref={audioRef} src="/gol.mp3" preload="auto" />
                <audio ref={audioRedCardRef} src="/tarjeta-roja.mp3" preload="auto" />

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>Cargando datos del partido...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="edit-match-form">
                        {/* Fecha y hora */}
                        <div className="form-group">
                            <label>Fecha y Hora:</label>
                            <input
                                type="datetime-local"
                                name="fecha_partido"
                                className="form-input"
                                value={formData.fecha_partido}
                                onChange={handleChange}
                                required
                                disabled={!isAdmin}
                            />
                        </div>

                        {/* Equipo Local */}
                        <div className="form-group">
                            <label>Equipo Local:</label>
                            <select
                                name="equipo_local"
                                className="form-input"
                                value={formData.equipo_local}
                                onChange={handleChange}
                                required
                                disabled={!isAdmin}
                            >
                                <option value="">Seleccionar equipo</option>
                                {equipos.map(equipo => (
                                    <option key={equipo.id_equipo} value={equipo.id_equipo}>
                                        {equipo.nombre_equipo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Resultado Local:</label>
                            <input
                                type="number"
                                name="resultado_local"
                                className="form-input"
                                value={formData.resultado_local}
                                onChange={handleChange}
                                min="0"
                                disabled={!isAdmin}
                            />
                        </div>

                        {/* Equipo Visitante */}
                        <div className="form-group">
                            <label>Equipo Visitante:</label>
                            <select
                                name="equipo_visitante"
                                className="form-input"
                                value={formData.equipo_visitante}
                                onChange={handleChange}
                                required
                                disabled={!isAdmin}
                            >
                                <option value="">Seleccionar equipo</option>
                                {equipos.map(equipo => (
                                    <option key={equipo.id_equipo} value={equipo.id_equipo}>
                                        {equipo.nombre_equipo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Resultado Visitante:</label>
                            <input
                                type="number"
                                name="resultado_visitante"
                                className="form-input"
                                value={formData.resultado_visitante}
                                onChange={handleChange}
                                min="0"
                                disabled={!isAdmin}
                            />
                        </div>

                        {/* Estadísticas de Jugadores */}
                        {(jugadoresLocal.length > 0 || jugadoresVisitante.length > 0) && (
                            <div className="stats-section">
                                <h4>Estadísticas de Jugadores</h4>

                                {/* Jugadores Local */}
                                {jugadoresLocal.length > 0 && (
                                    <div className="team-stats-group">
                                        <h5 style={{ color: '#3498db' }}>
                                            {equipos.find(e => e.id_equipo === Number(formData.equipo_local))?.nombre_equipo || 'Equipo Local'}
                                        </h5>
                                        {jugadoresLocal.map(jugador => {
                                            const key = getPlayerKey(jugador.id_usuario, 'local');
                                            const stats = estadisticasJugadores[key] || { goles: 0, amarillas: 0, rojas: 0 };
                                            return (
                                                <div key={key} className="player-stats-row">
                                                    <span className="player-name">{jugador.nombre || jugador.email}</span>
                                                    <div className="stat-control">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { 
                                                                e.preventDefault(); 
                                                                e.stopPropagation(); 
                                                                decrementarGol(jugador.id_usuario, 'local'); 
                                                            }}
                                                            disabled={!isAdmin || stats.goles === 0}
                                                        >-</button>
                                                        <span className={`stat-display goals ${stats.goles > 0 ? 'active' : ''}`}>
                                                            ⚽ {stats.goles}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { 
                                                                e.preventDefault(); 
                                                                e.stopPropagation(); 
                                                                toggleGol(jugador.id_usuario, 'local'); 
                                                                playGoalSound();
                                                            }}
                                                            disabled={!isAdmin}
                                                        >+</button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={`stat-button yellow ${stats.amarillas > 0 ? 'active' : ''}`}
                                                        onClick={(e) => { 
                                                            e.preventDefault(); 
                                                            e.stopPropagation(); 
                                                            toggleAmarilla(jugador.id_usuario, 'local'); 
                                                        }}
                                                        disabled={!isAdmin}
                                                    >🟨</button>
                                                    <button
                                                        type="button"
                                                        className={`stat-button red ${stats.rojas > 0 ? 'active' : ''}`}
                                                        onClick={(e) => { 
                                                            e.preventDefault(); 
                                                            e.stopPropagation(); 
                                                            toggleRoja(jugador.id_usuario, 'local'); 
                                                            playRedCardSound(); 
                                                        }}
                                                        disabled={!isAdmin}
                                                    >🟥</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Jugadores Visitante */}
                                {jugadoresVisitante.length > 0 && (
                                    <div className="team-stats-group">
                                        <h5 style={{ color: '#e74c3c' }}>
                                            {equipos.find(e => e.id_equipo === Number(formData.equipo_visitante))?.nombre_equipo || 'Equipo Visitante'}
                                        </h5>
                                        {jugadoresVisitante.map(jugador => {
                                            const key = getPlayerKey(jugador.id_usuario, 'visitante');
                                            const stats = estadisticasJugadores[key] || { goles: 0, amarillas: 0, rojas: 0 };
                                            return (
                                                <div key={key} className="player-stats-row">
                                                    <span className="player-name">{jugador.nombre || jugador.email}</span>
                                                    <div className="stat-control">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { 
                                                                e.preventDefault(); 
                                                                e.stopPropagation(); 
                                                                decrementarGol(jugador.id_usuario, 'visitante'); 
                                                            }}
                                                            disabled={!isAdmin || stats.goles === 0}
                                                        >-</button>
                                                        <span className={`stat-display goals ${stats.goles > 0 ? 'active' : ''}`}>
                                                            ⚽ {stats.goles}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { 
                                                                e.preventDefault(); 
                                                                e.stopPropagation(); 
                                                                toggleGol(jugador.id_usuario, 'visitante'); 
                                                                playGoalSound(); 
                                                            }}
                                                            disabled={!isAdmin}
                                                        >+</button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={`stat-button yellow ${stats.amarillas > 0 ? 'active' : ''}`}
                                                        onClick={(e) => { 
                                                            e.preventDefault(); 
                                                            e.stopPropagation(); 
                                                            toggleAmarilla(jugador.id_usuario, 'visitante'); 
                                                        }}
                                                        disabled={!isAdmin}
                                                    >🟨</button>
                                                    <button
                                                        type="button"
                                                        className={`stat-button red ${stats.rojas > 0 ? 'active' : ''}`}
                                                        onClick={(e) => { 
                                                            e.preventDefault(); 
                                                            e.stopPropagation(); 
                                                            toggleRoja(jugador.id_usuario, 'visitante'); 
                                                            playRedCardSound(); 
                                                        }}
                                                        disabled={!isAdmin}
                                                    >🟥</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-cancelar">
                                Cerrar
                            </button>
                            {isAdmin && (
                                <button type="submit" className="btn-guardar">
                                    Guardar Cambios
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// Componente principal
function TablaPosiciones({ usuario }) {
    const { idTorneo } = useParams();
    const navigate = useNavigate();

    const [tabla, setTabla] = useState([]);
    const [jornadas, setJornadas] = useState([]);
    const [jornadaActual, setJornadaActual] = useState(1);
    const [partidos, setPartidos] = useState([]);
    const [modalPartido, setModalPartido] = useState(null);
    const [loading, setLoading] = useState(false);

    const isAdmin = usuario?.rol === 'administrador';

    useEffect(() => {
        cargarTabla();
        cargarPartidosPorJornada(jornadaActual);
    }, [idTorneo, jornadaActual]);

    const cargarTabla = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/estadisticas/torneo/${idTorneo}`, {
                credentials: 'include'
            });

            const data = await response.json();

            if (Array.isArray(data.tabla)) {
                setTabla(data.tabla);
            } else {
                setTabla([]);
            }
        } catch (error) {
            console.error("Error al cargar la tabla:", error);
        }
    };

    async function cargarPartidosPorJornada(fechaSeleccionada) {
        try {
            const res = await fetch(`http://localhost:3000/partidos/${idTorneo}`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

            const data = await res.json();

            if (!Array.isArray(data)) {
                setPartidos([]);
                return;
            }

            // Agrupar partidos por fecha
            const fechasUnicas = [...new Set(data.map(p => {
                const fecha = new Date(p.fecha_partido);
                return fecha.toISOString().split('T')[0];
            }))].sort();

            setJornadas(fechasUnicas.map((fecha, index) => ({
                numero: index + 1,
                fecha: fecha
            })));

            // Filtrar partidos por la fecha seleccionada
            const fechaBuscada = fechasUnicas[fechaSeleccionada - 1];
            const partidosFiltrados = data.filter(p => {
                const fechaPartido = new Date(p.fecha_partido).toISOString().split('T')[0];
                return fechaPartido === fechaBuscada;
            });

            // Mapear los partidos
            const partidosMapeados = partidosFiltrados.map(p => ({
                ...p,
                goles_local: p.resultado_local ?? 0,
                goles_visitante: p.resultado_visitante ?? 0,
                fecha: new Date(p.fecha_partido).toLocaleDateString('es-AR'),
                hora: new Date(p.fecha_partido).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
            }));

            setPartidos(partidosMapeados);

        } catch (error) {
            console.error("Error al cargar partidos:", error);
            setPartidos([]);
        }
    }

    function abrirModal(partido) {
        setModalPartido(partido);
    }

async function guardarCambios(idPartido, dataToSend) {
    setLoading(true);
    try {
        // 1. Actualizar partido
        const response = await fetch(`http://localhost:3000/partidos/${idPartido}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(dataToSend),
        });

        if (!response.ok) throw new Error('Error al actualizar el partido');

        // 2. Guardar estadísticas de jugadores
        const jugadoresStatsMap = {};

        dataToSend.goleadores.forEach((id_jugador) => {
            if (!jugadoresStatsMap[id_jugador]) {
                jugadoresStatsMap[id_jugador] = { id_jugador, goles: 0, amarillas: 0, rojas: 0 };
            }
            jugadoresStatsMap[id_jugador].goles += 1;
        });

        dataToSend.amarillas.forEach((id_jugador) => {
            if (!jugadoresStatsMap[id_jugador]) {
                jugadoresStatsMap[id_jugador] = { id_jugador, goles: 0, amarillas: 0, rojas: 0 };
            }
            jugadoresStatsMap[id_jugador].amarillas = 1;
        });

        dataToSend.rojas.forEach((id_jugador) => {
            if (!jugadoresStatsMap[id_jugador]) {
                jugadoresStatsMap[id_jugador] = { id_jugador, goles: 0, amarillas: 0, rojas: 0 };
            }
            jugadoresStatsMap[id_jugador].rojas = 1;
        });

        const jugadoresStats = Object.values(jugadoresStatsMap);
        const jugadoresValidos = jugadoresStats.filter(j => j.id_jugador);

        if (jugadoresValidos.length > 0) {
            await fetch(`http://localhost:3000/api/estadisticas/jugadores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id_partido: idPartido,
                    jugadoresStats: jugadoresValidos
                }),
            });
        }

        alert('✅ Partido y estadísticas guardados correctamente');
        
        // 3. Cerrar modal y recargar - Ya se verá actualizado porque la query calcula en tiempo real
        setModalPartido(null);
        await cargarTabla();
        await cargarPartidosPorJornada(jornadaActual);

    } catch (error) {
        console.error("Error al guardar cambios:", error);
        alert('❌ Error al guardar los cambios: ' + error.message);
    } finally {
        setLoading(false);
    }
}

    return (
        <div className="tabla-posiciones-layout">
            <button className="btn-volver-ligas" onClick={() => navigate(-1)}>
                ← Volver
            </button>

            {/* Tabla de posiciones */}
            <div className="tabla-posiciones-col">
                <h2 className="titulo-tabla">Tabla de Posiciones</h2>
                <div className="table-responsive">
                    <table className="tabla-posiciones">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Equipo</th>
                                <th>Pts</th>
                                <th>PJ</th>
                                <th>PG</th>
                                <th>PE</th>
                                <th>PP</th>
                                <th>GF</th>
                                <th>GC</th>
                                <th>DG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tabla.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No hay equipos en la tabla
                                    </td>
                                </tr>
                            ) : (
                                tabla.map((eq, i) => (
                                    <tr key={eq.id_equipo || i}>
                                        <td>{i + 1}</td>
                                        <td className="nombre-equipo">{eq.nombre_equipo}</td>
                                        <td className="puntos">{eq.puntos}</td>
                                        <td>{eq.jugados || eq.partidos_jugados}</td>
                                        <td>{eq.ganados}</td>
                                        <td>{eq.empatados}</td>
                                        <td>{eq.perdidos}</td>
                                        <td>{eq.goles_favor || eq.goles_a_favor}</td>
                                        <td>{eq.goles_contra || eq.goles_en_contra}</td>
                                        <td>{eq.diferencia_goles}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Partidos por jornada */}
            <div className="jornada-partidos-col">
                <h2 className="titulo-jornada">Partidos</h2>

                {jornadas.length > 0 && (
                    <div className="jornada-selector">
                        <button
                            className="btn-nav-jornada"
                            onClick={() => setJornadaActual(p => Math.max(1, p - 1))}
                            disabled={jornadaActual === 1}
                        >←</button>

                        <select
                            className="select-jornada"
                            value={jornadaActual}
                            onChange={e => setJornadaActual(Number(e.target.value))}
                        >
                            {jornadas.map((jornada, index) => (
                                <option key={`fecha-${index}`} value={jornada.numero}>
                                    {new Date(jornada.fecha).toLocaleDateString('es-AR')}
                                </option>
                            ))}
                        </select>

                        <button
                            className="btn-nav-jornada"
                            onClick={() => setJornadaActual(p => Math.min(jornadas.length, p + 1))}
                            disabled={jornadaActual === jornadas.length}
                        >→</button>
                    </div>
                )}

                <div className="partidos-list">
                    {partidos.length === 0 ? (
                        <p>No hay partidos en esta jornada.</p>
                    ) : (
                        partidos.map(p => (
                            <div
                                key={p.id_partido}
                                className="match-card clickable"
                                onClick={() => abrirModal(p)}
                                style={{ cursor: 'pointer' }}
                                title={isAdmin ? "Click para editar" : "Click para ver detalles"}
                            >
                                <div className="match-info">
                                    <div className="match-date">{p.fecha}</div>
                                    <div className="match-time">{p.hora}</div>
                                </div>
                                <div className="match-teams">
                                    <div className="team-row">
                                        <span className="team-name">{p.equipo_local || 'Por definir'}</span>
                                        <span className="team-score">{p.goles_local ?? "-"}</span>
                                    </div>
                                    <div className="team-row">
                                        <span className="team-name">{p.equipo_visitante || 'Por definir'}</span>
                                        <span className="team-score">{p.goles_visitante ?? "-"}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de edición */}
            {modalPartido && (
                <EditMatchModal
                    partido={modalPartido}
                    onClose={() => setModalPartido(null)}
                    onSave={guardarCambios}
                    isAdmin={isAdmin}
                    idTorneo={idTorneo}
                />
            )}

            {/* Indicador de carga */}
            {loading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <p>Guardando cambios...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TablaPosiciones;