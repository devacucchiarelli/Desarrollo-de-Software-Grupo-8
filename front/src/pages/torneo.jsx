import { useEffect, useState } from 'react'
import '../styles/css/torneos.css'

export default function Torneos() {
    const [torneos, setTorneos] = useState([])
    const [mostrarForm, setMostrarForm] = useState(false)
    const [error, setError] = useState(null)
    const [equiposInscritos, setEquiposInscritos] = useState({}) // Nuevo estado
    const [formData, setFormData] = useState({
        nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "",
    })

    const ID_EQUIPO = 2; // ID hardcodeado del equipo

    useEffect(() => {
        cargarTorneos()
        cargarInscripciones()
    }, [])

    const cargarTorneos = async () => {
        try {
            const response = await fetch('http://localhost:3000/torneo')

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            console.log('Datos recibidos:', data)

            if (Array.isArray(data)) {
                setTorneos(data)
            } else {
                setTorneos([])
                console.warn('La respuesta no es un array:', data)
            }

            setError(null)
        } catch (error) {
            console.error('Error al cargar torneos:', error)
            setError(error.message)
            setTorneos([])
        }
    }

    const cargarInscripciones = async () => {
        try {
            const response = await fetch('http://localhost:3000/incripciones')
            
            if (!response.ok) {
                console.error('Error al cargar inscripciones')
                return
            }

            const inscripciones = await response.json()
            console.log('Inscripciones recibidas:', inscripciones)

            // Filtrar las inscripciones de mi equipo y crear un mapa
            const inscripcionesMap = {}
            
            if (Array.isArray(inscripciones)) {
                inscripciones.forEach(inscripcion => {
                    // Verificar si la inscripción pertenece a mi equipo (ID_EQUIPO = 2)
                    if (inscripcion.id_equipo === ID_EQUIPO || inscripcion.equipoId === ID_EQUIPO) {
                        const torneoId = inscripcion.id_torneo || inscripcion.torneoId
                        inscripcionesMap[torneoId] = true
                    }
                })
            }

            console.log('Equipos inscritos por torneo:', inscripcionesMap)
            setEquiposInscritos(inscripcionesMap)
        } catch (error) {
            console.error('Error al cargar inscripciones:', error)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const registrarEquipo = async (idTorneo) => {
        // Verificar si ya está inscrito antes de intentar registrar
        if (equiposInscritos[idTorneo]) {
            alert('Tu equipo ya está inscrito en este torneo')
            return
        }

        try {
            const response = await fetch('http://localhost:3000/incripciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    torneoId: idTorneo,
                    equipoId: ID_EQUIPO
                }),
            })

            if (response.ok) {
                alert('Equipo registrado exitosamente!')
                // Actualizar el estado local
                setEquiposInscritos(prev => ({
                    ...prev,
                    [idTorneo]: true
                }))
                // Recargar inscripciones para estar sincronizado
                cargarInscripciones()
            } else {
                const errorData = await response.json()
                alert(`Error: ${errorData.error || 'No se pudo registrar el equipo'}`)
            }
        } catch (error) {
            console.error('Error al registrar equipo:', error)
            alert('Error al registrar el equipo')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch('http://localhost:3000/torneo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre_torneo: formData.nombre,
                    fecha_inicio: formData.fechaInicio,
                    fecha_fin: formData.fechaFin,
                    tipo_torneo: formData.tipo,
                    formato: formData.formato
                }),
            })

            if (response.ok) {
                setMostrarForm(false)
                setFormData({ nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "" })
                cargarTorneos()
            } else {
                alert('Error al crear el torneo')
            }
        } catch (error) {
            console.error('Error al crear torneo:', error)
            alert('Error al crear el torneo')
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
                                    Inicio: {t.fecha_inicio} - Fin: {t.fecha_fin}
                                    <div style={{ marginTop: '10px' }}>
                                        {equiposInscritos[t.id_torneo] ? (
                                            <button
                                                className="btn-inscrito"
                                                disabled
                                            >
                                                ✓ Ya inscrito
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => registrarEquipo(t.id_torneo)}
                                                className="btn-registrar-equipo"
                                            >
                                                Registrar Equipo
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>

                    <div className="torneos-botones">
                        <button onClick={() => setMostrarForm(true)} className="btn-crear">
                            Crear nuevo torneo
                        </button>
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

                    <div className="form-botones">
                        <button type="submit" className="btn-submit">
                            Crear Torneo
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMostrarForm(false);
                                setFormData({ nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "" });
                            }}
                            className="btn-cancelar"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}