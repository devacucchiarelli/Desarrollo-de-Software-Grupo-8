import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../styles/css/tablaPosiciones.css'; // Asegúrate que este archivo exista

export default function TablaPosiciones({ isAdmin }) {
    const [tabla, setTabla] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editandoEquipo, setEditandoEquipo] = useState(null);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const { idTorneo } = useParams();
    const navigate = useNavigate();

    useEffect(() => { cargarTabla(); }, [idTorneo]);

    const cargarTabla = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3000/tabla/${idTorneo}`, {
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: No se pudo cargar la tabla`);
            }
            const data = await response.json();
            setTabla(data);
        } catch (err) {
            console.error("Error al cargar tabla:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const iniciarEdicion = (equipo) => {
        setEditandoEquipo(equipo.id_equipo);
        setNuevoNombre(equipo.nombre_equipo);
    };

    const cancelarEdicion = () => {
        setEditandoEquipo(null);
        setNuevoNombre('');
    };

    const guardarNombre = async (idEquipo) => {
        if (!nuevoNombre.trim()) {
            alert('El nombre del equipo no puede estar vacío');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/tabla/equipo/${idEquipo}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ nuevo_nombre: nuevoNombre.trim() })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}`);
            }

            // Actualizar la tabla local
            setTabla(prevTabla => 
                prevTabla.map(equipo => 
                    equipo.id_equipo === idEquipo 
                        ? { ...equipo, nombre_equipo: nuevoNombre.trim() }
                        : equipo
                )
            );

            setEditandoEquipo(null);
            setNuevoNombre('');
        } catch (err) {
            console.error("Error al actualizar nombre:", err);
            alert(`Error al actualizar el nombre: ${err.message}`);
        }
    };

    if (loading) return <div className="tabla-container"><p>Cargando tabla...</p></div>;
    if (error) return ( // <-- Paréntesis de apertura
        <div className="tabla-container">
            <button onClick={() => navigate('/')} className="btn-volver">← Volver</button>
            <p className="error-message">Error: {error}</p>
            <button onClick={cargarTabla}>Reintentar Carga</button>
        </div>
    );

    return (
        <div className="tabla-container">
            <button onClick={() => navigate('/')} className="btn-volver">← Volver</button>
            <h2>Tabla de Posiciones</h2>

            {tabla.length === 0 ? (
                <p>Aún no hay equipos o datos para mostrar.</p>
            ) : (
                <table className="tabla-posiciones">
                    <thead>
                        <tr>
                            <th>#</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tabla.map((equipo, index) => (
                            <tr key={equipo.id_equipo}>
                                <td>{index + 1}</td>
                                <td className="nombre-equipo">
                                    {editandoEquipo === equipo.id_equipo ? (
                                        <div className="edicion-nombre">
                                            <input
                                                type="text"
                                                value={nuevoNombre}
                                                onChange={(e) => setNuevoNombre(e.target.value)}
                                                className="input-nombre"
                                                autoFocus
                                            />
                                            <div className="botones-edicion">
                                                <button 
                                                    onClick={() => guardarNombre(equipo.id_equipo)}
                                                    className="btn-guardar"
                                                >
                                                    ✓
                                                </button>
                                                <button 
                                                    onClick={cancelarEdicion}
                                                    className="btn-cancelar"
                                                >
                                                    ✗
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="nombre-display">
                                            <span 
                                                onClick={() => iniciarEdicion(equipo)}
                                                className="nombre-clickeable"
                                                title="Haz clic para editar"
                                            >
                                                {equipo.nombre_equipo}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td>{equipo.PJ}</td><td>{equipo.PG}</td><td>{equipo.PE}</td><td>{equipo.PP}</td>
                                <td>{equipo.GF}</td><td>{equipo.GC}</td>
                                <td>{equipo.DG > 0 ? `+${equipo.DG}` : equipo.DG}</td>
                                <td className="puntos">{equipo.PTS}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {/* Aquí podrías añadir un botón para ver/gestionar los PARTIDOS de la liga si quisieras */}
        </div>
    );
}