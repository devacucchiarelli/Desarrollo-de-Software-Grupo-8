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

    const idCapitan = "2"; // hardcodeado por ahora

    // Lista de jugadores hardcodeada
    const jugadoresDisponibles = [
        { id: 1, nombre: "Juan Pérez", dni: "12345678" },
        { id: 2, nombre: "María Gómez", dni: "87654321" },
        { id: 3, nombre: "Carlos López", dni: "11223344" },
    ];

    // Ver si el capitán ya tiene un equipo
    useEffect(() => {
        async function fetchMiEquipo() {
            try {
                const res = await fetch(`http://localhost:3000/equipos/mi-equipo/${idCapitan}`);
                const data = await res.json();
                setMiEquipo(data);

                // Traer jugadores del equipo
                if (data && data.id_equipo) {
                    const resJugadores = await fetch(`http://localhost:3000/equipos/jugadores/${data.id_equipo}`);
                    const jugadores = await resJugadores.json();
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
        setJugadoresSeleccionados((prev) =>
            prev.includes(id)
                ? prev.filter((jugadorId) => jugadorId !== id)
                : [...prev, id]
        );
    };

    const handleAgregarJugadores = async () => {
        if (!miEquipo || jugadoresSeleccionados.length === 0) {
            return;
        }

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

            // Actualizamos la lista de jugadores del equipo
            setJugadoresDelEquipo((prev) => [...prev, ...data.jugadores_agregados]);
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

            // Actualizamos la lista local
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
                                        <strong>{jugador.nombre}</strong> • DNI: {jugador.dni} • {jugador.email}
                                    </div>
                                    <button
                                        className="eliminar-btn"
                                        onClick={() => handleEliminarJugador(jugador.id_usuario)}
                                    >
                                        Eliminar
                                    </button>
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
                                    {jugadoresDisponibles.map((jugador) => (
                                        <li key={jugador.id} className="modal-item">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    value={jugador.id}
                                                    checked={jugadoresSeleccionados.includes(jugador.id)}
                                                    onChange={() => toggleJugador(jugador.id)}
                                                />
                                                {jugador.nombre} (DNI: {jugador.dni})
                                            </label>
                                        </li>
                                    ))}
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