"use client";
import { useState, useEffect } from "react";
import "../styles/css/equipo.css";
import { useNavigate } from "react-router-dom";

export default function Page() {
    const navigate = useNavigate();
    const [nombreEquipo, setNombreEquipo] = useState("");
    const [miEquipo, setMiEquipo] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [jugadoresDelEquipo, setJugadoresDelEquipo] = useState([]);
    const [jugadoresDisponibles, setJugadoresDisponibles] = useState([]);

    const idCapitan = "2"; // hardcodeado por ahora

    // Traer todos los jugadores
    useEffect(() => {
        async function fetchJugadores() {
            try {
                const res = await fetch("http://localhost:3000/api/usuarios");
                if (!res.ok) throw new Error("Error al cargar jugadores");
                const data = await res.json();
                console.log('Jugadores disponibles:', data);
                setJugadoresDisponibles(data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchJugadores();
    }, []);

    // Traer equipo del capitán y jugadores del equipo
    useEffect(() => {
        async function fetchMiEquipo() {
            try {
                const res = await fetch(`http://localhost:3000/equipos/mi-equipo/${idCapitan}`);
                const data = await res.json();
                setMiEquipo(data);

                if (data && data.id_equipo) {
                    const resJugadores = await fetch(`http://localhost:3000/equipos/jugadores/${data.id_equipo}`);
                    const jugadores = await resJugadores.json();
                    console.log('Jugadores del equipo:', jugadores);
                    setJugadoresDelEquipo(jugadores);
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchMiEquipo();
    }, []);

    const handleCrearEquipo = async (e) => {
        e.preventDefault();
        const payload = { nombre_equipo: nombreEquipo, id_capitan: idCapitan };

        try {
            const res = await fetch("http://localhost:3000/equipos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Error en la petición");

            const data = await res.json();
            setMiEquipo(data);
            setMensaje(`Equipo creado: ${data.nombre_equipo}`);
            setNombreEquipo("");
        } catch (err) {
            console.error(err);
            setMensaje(err.message);
        }
    };

    const toggleJugador = (id) => {
        // Asegurarnos de que el id sea siempre número
        const jugadorId = parseInt(id);
        console.log('Toggling jugador:', jugadorId, 'Current selected:', jugadoresSeleccionados);
        
        setJugadoresSeleccionados((prev) =>
            prev.includes(jugadorId)
                ? prev.filter((selectedId) => selectedId !== jugadorId)
                : [...prev, jugadorId]
        );
    };

    const handleAgregarJugadores = async () => {
        if (!miEquipo || jugadoresSeleccionados.length === 0) return;

        const payload = {
            id_equipo: miEquipo.id_equipo,
            jugadoresIds: jugadoresSeleccionados,
        };

        try {
            const res = await fetch("http://localhost:3000/equipos/agregar-jugadores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Error al agregar jugadores");

            const data = await res.json();
            setJugadoresSeleccionados([]);
            setShowModal(false);
            
            // Refrescar la lista de jugadores del equipo
            const resJugadores = await fetch(`http://localhost:3000/equipos/jugadores/${miEquipo.id_equipo}`);
            const jugadoresActualizados = await resJugadores.json();
            setJugadoresDelEquipo(jugadoresActualizados);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEliminarJugador = async (idJugador) => {
        if (!miEquipo) return;

        try {
            const res = await fetch(
                `http://localhost:3000/equipos/eliminar-jugador/${miEquipo.id_equipo}/${idJugador}`,
                { method: "DELETE" }
            );

            if (!res.ok) throw new Error("Error al eliminar jugador");

            setJugadoresDelEquipo((prev) =>
                prev.filter((jugador) => jugador.id_usuario !== idJugador)
            );
        } catch (err) {
            console.error(err);
        }
    };

    if (miEquipo) {
        return (
            <div className="equipo-container">
                <div className="equipo-card">
                    <button className="volver-btn" onClick={() => navigate("/")}>
                        ← Volver
                    </button>

                    <h2 className="equipo-title">Mi equipo: {miEquipo.nombre_equipo}</h2>

                    <div className="jugadores-section">
                        <h3 className="jugadores-title">Jugadores del equipo</h3>
                        <ul className="jugadores-list">
                            {jugadoresDelEquipo.map((jugador, idx) => (
                                <li key={idx} className="jugador-item">
                                    <div className="jugador-info">
                                        <strong>{jugador.nombre}</strong> • {jugador.email}
                                        {parseInt(jugador.id_usuario) === parseInt(idCapitan) }
                                    </div>
                                    {parseInt(jugador.id_usuario) !== parseInt(idCapitan) ? (
                                        <button
                                            className="eliminar-btn"
                                            onClick={() => handleEliminarJugador(jugador.id_usuario)}
                                        >
                                            Eliminar
                                        </button>
                                    ) : (
                                        <span className="capitan-text">Capitán</span>
                                    )}
                                </li>
                            ))}
                        </ul>

                        <button className="agregar-btn" onClick={() => setShowModal(true)}>
                            + Agregar jugador
                        </button>
                    </div>

                    {showModal && (
                        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <h3 className="modal-title">Seleccionar jugadores</h3>
                                <ul className="modal-list">
                                    {jugadoresDisponibles
                                        .filter(j => {
                               
                                            const estaEnEquipo = jugadoresDelEquipo.some(jd => 
                                                parseInt(jd.id_usuario) === parseInt(j.id_usuario)
                                            );
                                            return !estaEnEquipo;
                                        })
                                        .map((jugador) => {
                                            const jugadorId = parseInt(jugador.id_usuario);
                                            const estaSeleccionado = jugadoresSeleccionados.includes(jugadorId);
                                            
                                            return (
                                                <li key={jugadorId} className="modal-item">
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={estaSeleccionado}
                                                            onChange={() => toggleJugador(jugadorId)}
                                                        />
                                                        {jugador.nombre} (Email: {jugador.email})
                                                    </label>
                                                </li>
                                            );
                                        })}
                                </ul>
                                <button className="modal-agregar-btn" onClick={handleAgregarJugadores}>
                                    Agregar seleccionados
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="equipo-container">
            <form className="crear-equipo-form" onSubmit={handleCrearEquipo}>
                <h2 className="equipo-title">Crear nuevo equipo</h2>
                <input
                    className="crear-equipo-input"
                    type="text"
                    placeholder="Nombre del equipo"
                    value={nombreEquipo}
                    onChange={(e) => setNombreEquipo(e.target.value)}
                />
                <button className="crear-equipo-btn" type="submit">
                    Crear equipo
                </button>
                {mensaje && <p className="mensaje">{mensaje}</p>}
            </form>
        </div>
    );
}