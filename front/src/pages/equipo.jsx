"use client";
import { useState, useEffect } from "react";
import "../styles/css/equipo.css";
import { useNavigate } from "react-router-dom";

export default function Page({ usuario: usuarioProp }) {
  console.log('🟢 Usuario recibido en Equipo:', usuarioProp);
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(usuarioProp || null);
  const [nombreEquipo, setNombreEquipo] = useState("");
  const [miEquipo, setMiEquipo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [jugadoresDelEquipo, setJugadoresDelEquipo] = useState([]);
  const [jugadoresDisponibles, setJugadoresDisponibles] = useState([]);
  const [todosLosEquipos, setTodosLosEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener usuario autenticado si no viene por props
  useEffect(() => {
    if (usuarioProp) {
      setUsuario(usuarioProp);
      setLoading(false);
      return;
    }

    async function fetchUsuario() {
      try {
        const res = await fetch("http://localhost:3000/usuarios/me", {
          credentials: "include",
        });
        if (!res.ok) {
          navigate("/login");
          return;
        }
        const data = await res.json();
        setUsuario(data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        navigate("/login");
      }
    }
    fetchUsuario();
  }, [navigate, usuarioProp]);

  // Traer todos los jugadores (para capitán y admin)
  useEffect(() => {
    if (!usuario) return;
    if (usuario.rol === 'jugador') return;

    async function fetchJugadores() {
      try {
        const res = await fetch("http://localhost:3000/usuarios", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error al cargar jugadores");
        const data = await res.json();
        const jugadoresFiltrados = data.filter(u => u.rol !== 'administrador');
        setJugadoresDisponibles(jugadoresFiltrados);
      } catch (error) {
        console.error(error);
      }
    }
    fetchJugadores();
  }, [usuario]);

  // Traer equipos según el rol
  useEffect(() => {
    if (!usuario) return;

    console.log('Usuario en fetchEquipos:', usuario); // DEBUG

    async function fetchEquipos() {
      try {
        if (usuario.rol === 'administrador') {
          const res = await fetch("http://localhost:3000/equipos", {
            credentials: "include",
          });
          const data = await res.json();
          setTodosLosEquipos(data);
        } else if (usuario.rol === 'capitan') {
          // Usar el campo correcto del usuario
          const userId = usuario.id_usuario || usuario.id;
          console.log('ID del usuario capitán:', userId); // DEBUG
          
          if (!userId) {
            console.error('No se encontró ID del usuario');
            return;
          }

          const res = await fetch(`http://localhost:3000/equipos/mi-equipo/${userId}`, {
            credentials: "include",
          });
          
          if (res.ok) {
            const data = await res.json();
            setMiEquipo(data);

            if (data && data.id_equipo) {
              await cargarJugadoresEquipo(data.id_equipo);
            }
          } else if (res.status === 404) {
            setMiEquipo(null);
          }
        } else if (usuario.rol === 'jugador') {
          const res = await fetch("http://localhost:3000/equipos", {
            credentials: "include",
          });
          const equipos = await res.json();
          
          for (const equipo of equipos) {
            const resJugadores = await fetch(
              `http://localhost:3000/equipos/jugadores/${equipo.id_equipo}`,
              { credentials: "include" }
            );
            const jugadores = await resJugadores.json();
            
            if (jugadores.some(j => parseInt(j.id_jugador) === parseInt(usuario.id_usuario))) {
              setMiEquipo(equipo);
              setJugadoresDelEquipo(jugadores);
              break;
            }
          }
        }
      } catch (err) {
        console.error("Error al cargar equipos:", err);
      }
    }
    fetchEquipos();
  }, [usuario]);

  const cargarJugadoresEquipo = async (idEquipo) => {
    try {
      const resJugadores = await fetch(
        `http://localhost:3000/equipos/jugadores/${idEquipo}`,
        { credentials: "include" }
      );
      const jugadores = await resJugadores.json();
      setJugadoresDelEquipo(jugadores);
    } catch (err) {
      console.error("Error al cargar jugadores:", err);
    }
  };

  const handleCrearEquipo = async (e) => {
    e.preventDefault();
    if (!usuario) return;

    // Obtener el ID correcto
    const userId = usuario.id_usuario || usuario.id;

    const payload = { 
      nombre_equipo: nombreEquipo, 
      id_capitan: usuario.rol === 'administrador' ? null : userId 
    };

    console.log('=== CREAR EQUIPO ===');
    console.log('Usuario completo:', usuario);
    console.log('User ID extraído:', userId);
    console.log('Payload a enviar:', payload);

    try {
      const res = await fetch("http://localhost:3000/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      console.log('Status de respuesta:', res.status);
      
      const responseData = await res.json();
      console.log('Respuesta del servidor:', responseData);

      if (!res.ok) {
        throw new Error(responseData.error || "Error al crear equipo");
      }

      const data = responseData;
      
      if (usuario.rol === 'administrador') {
        setTodosLosEquipos(prev => [...prev, data]);
        setMensaje(`Equipo creado: ${data.nombre_equipo}`);
      } else if (usuario.rol === 'capitan') {
        setMiEquipo(data);
        setMensaje(`¡Equipo "${data.nombre_equipo}" creado exitosamente!`);
        console.log('Equipo creado para capitán:', data);
        
        // Cargar el capitán como primer jugador
        if (data.id_equipo) {
          console.log('Cargando jugadores del equipo:', data.id_equipo);
          await cargarJugadoresEquipo(data.id_equipo);
        }
      }
      
      setNombreEquipo("");
    } catch (err) {
      console.error('ERROR AL CREAR EQUIPO:', err);
      setMensaje(err.message);
    }
  };

  const toggleJugador = (id) => {
    const jugadorId = parseInt(id);
    setJugadoresSeleccionados((prev) =>
      prev.includes(jugadorId)
        ? prev.filter((selectedId) => selectedId !== jugadorId)
        : [...prev, jugadorId]
    );
  };

  const handleAgregarJugadores = async () => {
    const equipoId = usuario.rol === 'administrador' 
      ? equipoSeleccionado?.id_equipo 
      : miEquipo?.id_equipo;

    if (!equipoId || jugadoresSeleccionados.length === 0) {
      setMensaje("Selecciona al menos un jugador");
      return;
    }

    const payload = {
      id_equipo: equipoId,
      jugadoresIds: jugadoresSeleccionados,
    };

    try {
      const res = await fetch("http://localhost:3000/equipos/agregar-jugadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al agregar jugadores");

      setJugadoresSeleccionados([]);
      setShowModal(false);
      await cargarJugadoresEquipo(equipoId);
      setMensaje("Jugadores agregados exitosamente");
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error(err);
      setMensaje("Error al agregar jugadores");
    }
  };

  const handleEliminarJugador = async (idJugador) => {
    const equipoId = usuario.rol === 'administrador' 
      ? equipoSeleccionado?.id_equipo 
      : miEquipo?.id_equipo;

    if (!equipoId) return;

    // Evitar que el capitán se elimine a sí mismo
    if (usuario.rol === 'capitan' && parseInt(idJugador) === parseInt(usuario.id_usuario)) {
      setMensaje("No puedes eliminarte a ti mismo del equipo");
      return;
    }

    if (!window.confirm("¿Estás seguro de eliminar este jugador?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/equipos/eliminar-jugador/${equipoId}/${idJugador}`,
        { method: "DELETE", credentials: "include" }
      );

      if (!res.ok) throw new Error("Error al eliminar jugador");

      setJugadoresDelEquipo((prev) =>
        prev.filter((jugador) => jugador.id_jugador !== idJugador)
      );
      setMensaje("Jugador eliminado exitosamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      console.error(err);
      setMensaje("Error al eliminar jugador");
    }
  };

  const handleVerEquipo = async (equipo) => {
    setEquipoSeleccionado(equipo);
    await cargarJugadoresEquipo(equipo.id_equipo);
  };

  if (loading) {
    return <div className="equipo-container"><p>Cargando...</p></div>;
  }

  if (!usuario) {
    return <div className="equipo-container"><p>No autorizado</p></div>;
  }

  // ====== VISTA PARA ADMINISTRADOR ======
  if (usuario.rol === 'administrador') {
    return (
      <div className="equipo-container">
        <div className="equipo-card">
          <button className="volver-btn" onClick={() => navigate("/")}>
            ← Volver
          </button>

          <h2 className="equipo-title">Gestión de Equipos (Admin)</h2>

          <form className="crear-equipo-form" onSubmit={handleCrearEquipo}>
            <input
              className="crear-equipo-input"
              type="text"
              placeholder="Nombre del nuevo equipo"
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(e.target.value)}
              required
            />
            <button className="crear-equipo-btn" type="submit">
              Crear equipo
            </button>
          </form>

          {mensaje && <p className="mensaje">{mensaje}</p>}

          <div className="equipos-section">
            <h3 className="jugadores-title">Todos los equipos ({todosLosEquipos.length})</h3>
            {todosLosEquipos.length === 0 ? (
              <p>No hay equipos creados todavía</p>
            ) : (
              <ul className="jugadores-list">
                {todosLosEquipos.map((equipo) => (
                  <li key={equipo.id_equipo} className="jugador-item">
                    <div className="jugador-info">
                      <strong>{equipo.nombre_equipo}</strong>
                    </div>
                    <button
                      className="agregar-btn"
                      onClick={() => handleVerEquipo(equipo)}
                    >
                      Ver/Editar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {equipoSeleccionado && (
            <div className="jugadores-section">
              <h3 className="jugadores-title">
                Jugadores de {equipoSeleccionado.nombre_equipo}
              </h3>
              <ul className="jugadores-list">
                {jugadoresDelEquipo.map((jugador) => (
                  <li key={jugador.id_jugador} className="jugador-item">
                    <div className="jugador-info">
                      <strong>{jugador.nombre}</strong> • {jugador.email}
                    </div>
                    <button
                      className="eliminar-btn"
                      onClick={() => handleEliminarJugador(jugador.id_jugador)}
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
          )}

          {showModal && (
            <div className="modal-backdrop" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Seleccionar jugadores</h3>
                <ul className="modal-list">
                  {jugadoresDisponibles
                    .filter(j => !jugadoresDelEquipo.some(jd => 
                      parseInt(jd.id_jugador) === parseInt(j.id_usuario)
                    ))
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
                            {jugador.nombre} ({jugador.email}) - {jugador.rol}
                          </label>
                        </li>
                      );
                    })}
                </ul>
                <button className="modal-agregar-btn" onClick={handleAgregarJugadores}>
                  Agregar seleccionados
                </button>
                <button 
                  className="modal-cerrar-btn" 
                  onClick={() => setShowModal(false)}
                  style={{ marginTop: '10px', background: '#666' }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ====== VISTA PARA CAPITÁN ======
  if (usuario.rol === 'capitan') {
    // Capitán CON equipo
    if (miEquipo) {
      return (
        <div className="equipo-container">
          <div className="equipo-card">
            <button className="volver-btn" onClick={() => navigate("/")}>
              ← Volver
            </button>

            <h2 className="equipo-title">Mi equipo: {miEquipo.nombre_equipo}</h2>

            {mensaje && <p className="mensaje">{mensaje}</p>}

            <div className="jugadores-section">
              <h3 className="jugadores-title">Jugadores del equipo ({jugadoresDelEquipo.length})</h3>
              {jugadoresDelEquipo.length === 0 ? (
                <p>No hay jugadores en el equipo. Agrega jugadores para comenzar.</p>
              ) : (
                <ul className="jugadores-list">
                  {jugadoresDelEquipo.map((jugador) => (
                    <li key={jugador.id_jugador} className="jugador-item">
                      <div className="jugador-info">
                        <strong>{jugador.nombre}</strong> • {jugador.email}
                        {parseInt(jugador.id_jugador) === parseInt(usuario.id_usuario) && (
                          <span className="capitan-text"> • Capitán (tú)</span>
                        )}
                      </div>
                      {parseInt(jugador.id_jugador) !== parseInt(usuario.id_usuario) && (
                        <button
                          className="eliminar-btn"
                          onClick={() => handleEliminarJugador(jugador.id_jugador)}
                        >
                          Eliminar
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <button className="agregar-btn" onClick={() => setShowModal(true)}>
                + Agregar jugador
              </button>
            </div>

            {showModal && (
              <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3 className="modal-title">Seleccionar jugadores para agregar</h3>
                  <ul className="modal-list">
                    {jugadoresDisponibles
                      .filter(j => !jugadoresDelEquipo.some(jd => 
                        parseInt(jd.id_jugador) === parseInt(j.id_usuario)
                      ))
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
                              {jugador.nombre} ({jugador.email})
                            </label>
                          </li>
                        );
                      })}
                  </ul>
                  <button className="modal-agregar-btn" onClick={handleAgregarJugadores}>
                    Agregar seleccionados
                  </button>
                  <button 
                    className="modal-cerrar-btn" 
                    onClick={() => setShowModal(false)}
                    style={{ marginTop: '10px', background: '#666' }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Capitán SIN equipo: mostrar formulario
    return (
      <div className="equipo-container">
        <div className="equipo-card">
          <button className="volver-btn" onClick={() => navigate("/")}>
            ← Volver
          </button>

          <h2 className="equipo-title">Crear tu equipo</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Como capitán, puedes crear un equipo y agregar jugadores
          </p>

          <form className="crear-equipo-form" onSubmit={handleCrearEquipo}>
            <input
              className="crear-equipo-input"
              type="text"
              placeholder="Nombre del equipo"
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(e.target.value)}
              required
            />
            <button className="crear-equipo-btn" type="submit">
              Crear mi equipo
            </button>
          </form>

          {mensaje && <p className="mensaje">{mensaje}</p>}
        </div>
      </div>
    );
  }

  // ====== VISTA PARA JUGADOR (SOLO LECTURA) ======
  if (usuario.rol === 'jugador') {
    if (miEquipo) {
      return (
        <div className="equipo-container">
          <div className="equipo-card">
            <button className="volver-btn" onClick={() => navigate("/")}>
              ← Volver
            </button>

            <h2 className="equipo-title">Mi equipo: {miEquipo.nombre_equipo}</h2>

            <div className="jugadores-section">
              <h3 className="jugadores-title">Compañeros de equipo</h3>
              <ul className="jugadores-list">
                {jugadoresDelEquipo.map((jugador) => (
                  <li key={jugador.id_jugador} className="jugador-item">
                    <div className="jugador-info">
                      <strong>{jugador.nombre}</strong> • {jugador.email}
                      {parseInt(jugador.id_jugador) === parseInt(miEquipo.id_capitan) && (
                        <span className="capitan-text"> • Capitán</span>
                      )}
                      {parseInt(jugador.id_jugador) === parseInt(usuario.id_usuario) && (
                        <span className="capitan-text"> • (Tú)</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="equipo-container">
        <div className="equipo-card">
          <button className="volver-btn" onClick={() => navigate("/")}>
            ← Volver
          </button>
          <h2 className="equipo-title">Sin equipo</h2>
          <p className="mensaje">No estás asignado a ningún equipo todavía. Espera a que un capitán te agregue a su equipo.</p>
        </div>
      </div>
    );
  }

  return null;
}