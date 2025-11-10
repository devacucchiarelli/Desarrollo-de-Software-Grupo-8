import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/css/torneos.css'

export default function Torneos({ usuario }) {
    const navigate = useNavigate()
    const [torneos, setTorneos] = useState([])
    const [mostrarForm, setMostrarForm] = useState(false)
    const [error, setError] = useState(null)
    const [equiposInscritos, setEquiposInscritos] = useState({})
    const [todosLosEquipos, setTodosLosEquipos] = useState([])
    const [miEquipo, setMiEquipo] = useState(null)
    const [mostrarModalInscripcion, setMostrarModalInscripcion] = useState(false)
    const [torneoSeleccionado, setTorneoSeleccionado] = useState(null)
    const [equipoSeleccionado, setEquipoSeleccionado] = useState('')
    const [formData, setFormData] = useState({
        nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "", cantidadEquipos: ""
    })

    // Helpers de roles
    const isAdmin = usuario?.rol === 'administrador';
    const isCapitan = usuario?.rol === 'capitan';
    const isJugador = usuario?.rol === 'jugador';

    const API_TORNEOS = 'http://localhost:3000/torneo';
    const API_INSCRIPCIONES = 'http://localhost:3000/inscripciones';
    const API_EQUIPOS = 'http://localhost:3000/equipos';

    useEffect(() => {
        cargarTorneos()
        cargarInscripciones()

        if (isAdmin) {
            cargarTodosLosEquipos()
        } else if (isCapitan && usuario?.id_usuario) {
            cargarMiEquipo()
        }
    }, [usuario])

    const cargarMiEquipo = async () => {
        try {
            const response = await fetch(`${API_EQUIPOS}/mi-equipo/${usuario.id_usuario}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setMiEquipo(data);
            }
        } catch (err) {
            console.error('Error al cargar mi equipo:', err);
        }
    }

    const cargarTorneos = async () => {
        try {
            const response = await fetch(API_TORNEOS, { credentials: 'include' });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            const data = await response.json();
            setTorneos(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error al cargar torneos:', err);
            setError(err.message);
            setTorneos([]);
        }
    }

    const cargarInscripciones = async () => {
        try {
            const response = await fetch(API_INSCRIPCIONES, { credentials: 'include' });
            if (!response.ok) throw new Error('Error al cargar inscripciones');
            const inscripciones = await response.json();

            const inscripcionesMap = {};
            inscripciones.forEach(ins => {
                const torneoId = ins.id_torneo;
                const equipoId = ins.id_equipo;

                if (!inscripcionesMap[torneoId]) {
                    inscripcionesMap[torneoId] = [];
                }
                inscripcionesMap[torneoId].push(equipoId);
            });

            setEquiposInscritos(inscripcionesMap);
        } catch (err) {
            console.error('Error al cargar inscripciones:', err);
        }
    }

    const cargarTodosLosEquipos = async () => {
        try {
            const response = await fetch(API_EQUIPOS, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setTodosLosEquipos(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Error al cargar equipos:', err);
        }
    }

    const abrirModalInscripcion = (torneo) => {
        setTorneoSeleccionado(torneo);
        setEquipoSeleccionado('');
        setMostrarModalInscripcion(true);
    }

    const cerrarModalInscripcion = () => {
        setMostrarModalInscripcion(false);
        setTorneoSeleccionado(null);
        setEquipoSeleccionado('');
    }

    const registrarEquipo = async (idTorneo, idEquipo) => {
        if (!idEquipo) {
            return alert('No se encontró el equipo a registrar');
        }

        if (equiposInscritos[idTorneo]?.includes(idEquipo)) {
            return alert('Este equipo ya está inscrito en este torneo');
        }

        try {
            const response = await fetch(API_INSCRIPCIONES, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id_torneo: idTorneo,
                    id_equipo: idEquipo
                })
            });

            if (response.ok) {
                cargarInscripciones();
                cerrarModalInscripcion();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'No se pudo registrar el equipo'}`);
            }
        } catch (err) {
            console.error('Error al registrar equipo:', err);
            alert('Error al registrar el equipo');
        }
    }

    const handleInscripcionAdmin = () => {
        if (!equipoSeleccionado) {
            return alert('Por favor selecciona un equipo');
        }
        registrarEquipo(torneoSeleccionado.id_torneo, parseInt(equipoSeleccionado));
    }

    const handleInscripcionCapitan = (idTorneo) => {
        if (!miEquipo) {
            return alert('Primero debes crear tu equipo');
        }
        registrarEquipo(idTorneo, miEquipo.id_equipo);
    }

    const miEquipoEstaInscrito = (idTorneo) => {
        if (!miEquipo) return false;
        return equiposInscritos[idTorneo]?.includes(miEquipo.id_equipo);
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_TORNEOS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    nombre_torneo: formData.nombre,
                    fecha_inicio: formData.fechaInicio,
                    fecha_fin: formData.fechaFin,
                    tipo_torneo: formData.tipo,
                    formato: formData.formato,
                    cantidad_equipos: parseInt(formData.cantidadEquipos, 10)
                })
            });
            if (!response.ok) throw new Error('Error al crear el torneo');
            setMostrarForm(false);
            setFormData({ nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "", cantidadEquipos: "" });
            cargarTorneos();
        } catch (err) {
            console.error('Error al crear torneo:', err);
            alert(err.message);
        }
    }

    return (
        <div className="torneos-container">
            <h2>Torneos registrados</h2>

            {error && (
                <div style={{ padding: '1rem', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '1rem' }}>
                    Error: {error}
                </div>
            )}

            {!mostrarForm ? (
                <>
                    <ul className="torneos-lista">
                        {torneos.length === 0 ? (
                            <p>No hay torneos registrados</p>
                        ) : (
                            torneos.map((t, i) => (
                                <li key={i} className="torneo-item">
                                    <strong>{t.nombre_torneo}</strong><br />
                                    Tipo: {t.tipo_torneo} - Formato: {t.formato}<br />
                                    Inicio: {t.fecha_inicio} - Fin: {t.fecha_fin}<br />
                                    {equiposInscritos[t.id_torneo]?.length > 0 && (
                                        <small>Equipos inscritos: {equiposInscritos[t.id_torneo].length}</small>
                                    )}

                                    <div style={{
                                        marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
                                        {/* LÓGICA POR ROLES */}

                                        {/* ADMINISTRADOR: Puede inscribir cualquier equipo */}
                                        {isAdmin && (
                                            <button
                                                onClick={() => abrirModalInscripcion(t)}
                                                className="btn-registrar-equipo"
                                            >
                                                Inscribir Equipo
                                            </button>
                                        )}

                                        {/* CAPITÁN: Solo su equipo */}
                                        {isCapitan && (
                                            miEquipo ? (
                                                miEquipoEstaInscrito(t.id_torneo) ? (
                                                    <button className="btn-inscrito" disabled>
                                                        ✓ Mi equipo ya inscrito
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleInscripcionCapitan(t.id_torneo)}
                                                        className="btn-registrar-equipo"
                                                    >
                                                        Inscribir Mi Equipo
                                                    </button>
                                                )
                                            ) : (
                                                <button className="btn-sin-equipo" disabled>
                                                    Primero crea tu equipo
                                                </button>
                                            )
                                        )}

                                        {/* JUGADOR: Solo puede ver, no inscribir */}
                                        {isJugador && (
                                            <span style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                                                Solo tu capitán puede inscribir el equipo
                                            </span>
                                        )}

                                        {/* Botones de Ver Fixture/Tabla (todos los roles) */}
                                        {t.formato === 'eliminatoria' && (
                                            <button
                                                onClick={() => navigate(`/torneo/${t.id_torneo}/fixture`)}
                                                className="btn-ver-fixture"
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#2196F3',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Ver Fixture
                                            </button>
                                        )}

                                        {t.formato === 'liga' && (
                                            <button
                                                onClick={() => navigate(`/torneo/${t.id_torneo}/tabla`)}
                                                className="btn-ver-tabla"
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#4CAF50',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Ver Tabla
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>

                    <div className="torneos-botones">
                        {isAdmin && (
                            <button onClick={() => setMostrarForm(true)} className="btn-crear">
                                Crear nuevo torneo
                            </button>
                        )}
                        <a href="/" className="btn-volver">
                            Volver
                        </a>
                    </div>
                </>
            ) : (
                <form onSubmit={handleSubmit} className="torneos-form">
                    <h3>Crear Nuevo Torneo</h3>

                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre del torneo"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />

                    <div className="form-group">
                        <label>Fecha de inicio</label>
                        <input
                            type="date"
                            name="fechaInicio"
                            value={formData.fechaInicio}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Fecha de fin</label>
                        <input
                            type="date"
                            name="fechaFin"
                            value={formData.fechaFin}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        className="form-input"
                        required
                    >
                        <option value="">Seleccionar tipo</option>
                        <option value="futbol_5">Fútbol 5</option>
                        <option value="futbol_7">Fútbol 7</option>
                        <option value="futbol_11">Fútbol 11</option>
                    </select>

                    <select
                        name="formato"
                        value={formData.formato}
                        onChange={handleChange}
                        className="form-input"
                        required
                    >
                        <option value="">Seleccionar formato</option>
                        <option value="liga">Liga</option>
                        <option value="eliminatoria">Eliminatoria</option>
                    </select>

                    {formData.formato && (
                        <div className="form-group">
                            <label>Cantidad de equipos</label>
                            {formData.formato === 'eliminatoria' ? (
                                <select
                                    name="cantidadEquipos"
                                    value={formData.cantidadEquipos}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Seleccionar cantidad</option>
                                    <option value="8">8 equipos</option>
                                    <option value="16">16 equipos</option>
                                    <option value="32">32 equipos</option>
                                </select>
                            ) : (
                                <input
                                    type="number"
                                    name="cantidadEquipos"
                                    placeholder="Entre 4 y 30 equipos"
                                    value={formData.cantidadEquipos}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="4"
                                    max="30"
                                    required
                                />
                            )}
                        </div>
                    )}

                    <div className="form-botones">
                        <button type="submit" className="btn-submit">
                            Crear Torneo
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMostrarForm(false);
                                setFormData({ nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "", cantidadEquipos: "" });
                            }}
                            className="btn-cancelar"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Modal de Inscripción SOLO para Admin */}
            {mostrarModalInscripcion && torneoSeleccionado && isAdmin && (
                <div className="modal-backdrop" onClick={cerrarModalInscripcion}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Inscribir Equipo - {torneoSeleccionado.nombre_torneo}</h3>

                        <div className="form-group">
                            <label>Seleccionar Equipo:</label>
                            <select
                                value={equipoSeleccionado}
                                onChange={(e) => setEquipoSeleccionado(e.target.value)}
                                className="form-input"
                            >
                                <option value="">-- Selecciona un equipo --</option>
                                {todosLosEquipos
                                    .filter(eq => !equiposInscritos[torneoSeleccionado.id_torneo]?.includes(eq.id_equipo))
                                    .map(equipo => (
                                        <option key={equipo.id_equipo} value={equipo.id_equipo}>
                                            {equipo.nombre_equipo}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={cerrarModalInscripcion} className="btn-cancelar">
                                Cancelar
                            </button>
                            <button onClick={handleInscripcionAdmin} className="btn-guardar">
                                Inscribir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}