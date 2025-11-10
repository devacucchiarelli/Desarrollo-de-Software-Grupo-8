import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/css/equipo.css";

export default function Page({ usuario: usuarioProp }) {
  const navigate = useNavigate();
  const { idEquipo } = useParams();
  const [usuario, setUsuario] = useState(usuarioProp || null);
  const [nombreEquipo, setNombreEquipo] = useState("");
  const [miEquipo, setMiEquipo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [jugadoresDelEquipo, setJugadoresDelEquipo] = useState([]);
  const [todosLosEquipos, setTodosLosEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [equipoPublico, setEquipoPublico] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState([]);
  const [jugadoresDisponibles, setJugadoresDisponibles] = useState([]);

  // Obtener usuario autenticado
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

  // Cargar datos según el rol
  useEffect(() => {
    if (!usuario) return;

    async function fetchData() {
      try {
        if (usuario.rol === 'administrador') {
          const res = await fetch("http://localhost:3000/equipos", {
            credentials: "include",
          });
          const data = await res.json();
          setTodosLosEquipos(data);

          const resJugadores = await fetch("http://localhost:3000/usuarios", {
            credentials: "include",
          });
          const jugadores = await resJugadores.json();
          setJugadoresDisponibles(jugadores.filter(u => u.rol !== 'administrador'));
        } else if (usuario.rol === 'capitan') {
          const userId = usuario.id_usuario || usuario.id;
          const res = await fetch(`http://localhost:3000/equipos/mi-equipo/${userId}`, {
            credentials: "include",
          });
          
          if (res.ok) {
            const data = await res.json();
            setMiEquipo(data);
            if (data && data.id_equipo) {
              await cargarJugadoresEquipo(data.id_equipo);
              await cargarSolicitudes(data.id_equipo);
            }
          }

          const resJugadores = await fetch("http://localhost:3000/usuarios", {
            credentials: "include",
          });
          const jugadores = await resJugadores.json();
          setJugadoresDisponibles(jugadores.filter(u => u.rol !== 'administrador'));
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
            
            if (jugadores.some(j => parseInt(j.id_usuario) === parseInt(usuario.id_usuario))) {
              setMiEquipo(equipo);
              setJugadoresDelEquipo(jugadores);
              break;
            }
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    }
    fetchData();
  }, [usuario]);

  // Cargar equipo público si viene por URL
  useEffect(() => {
    if (idEquipo && !equipoPublico) {
      cargarEquipoPublico(idEquipo);
    }
  }, [idEquipo]);

  const cargarEquipoPublico = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/equipos/detalle/${id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setEquipoPublico(data);
      }
    } catch (err) {
      console.error("Error al cargar equipo:", err);
    }
  };

  const cargarJugadoresEquipo = async (idEquipo) => {
    try {
      const res = await fetch(
        `http://localhost:3000/equipos/jugadores/${idEquipo}`,
        { credentials: "include" }
      );
      const jugadores = await res.json();
      setJugadoresDelEquipo(jugadores);
    } catch (err) {
      console.error("Error al cargar jugadores:", err);
    }
  };

  const cargarSolicitudes = async (idEquipo) => {
    try {
      const res = await fetch(
        `http://localhost:3000/equipos/solicitudes/${idEquipo}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setSolicitudesPendientes(data);
    } catch (err) {
      console.error("Error al cargar solicitudes:", err);
    }
  };

  const handleCrearEquipo = async (e) => {
    e.preventDefault();
    if (!usuario) return;

    const userId = usuario.id_usuario || usuario.id;
    const payload = { 
      nombre_equipo: nombreEquipo, 
      id_capitan: usuario.rol === 'administrador' ? null : userId 
    };

    try {
      const res = await fetch("http://localhost:3000/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      if (usuario.rol === 'capitan') {
        setMiEquipo(data);
        await cargarJugadoresEquipo(data.id_equipo);
      } else {
        setTodosLosEquipos(prev => [...prev, data]);
      }
      
      setMensaje(`Equipo creado: ${data.nombre_equipo}`);
      setNombreEquipo("");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const handleSolicitarInscripcion = async () => {
    if (!usuario || !equipoPublico) return;

    try {
      const res = await fetch("http://localhost:3000/equipos/solicitar-inscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_equipo: equipoPublico.id_equipo }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMensaje("✅ Solicitud enviada al capitán. Espera su respuesta.");
      setTimeout(() => setMensaje(""), 4000);
    } catch (err) {
      setMensaje(`❌ ${err.message}`);
      setTimeout(() => setMensaje(""), 4000);
    }
  };

  const handleResponderSolicitud = async (idSolicitud, estado) => {
    const equipoId = usuario.rol === 'administrador' 
      ? equipoSeleccionado?.id_equipo 
      : miEquipo?.id_equipo;

    try {
      const res = await fetch(
        `http://localhost:3000/equipos/solicitudes/${idSolicitud}/responder`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado }),
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Error al responder solicitud");

      await cargarSolicitudes(equipoId);
      await cargarJugadoresEquipo(equipoId);
      
      const textoEstado = estado === 'aceptada' ? 'aceptada ✅' : 'rechazada ❌';
      setMensaje(`Solicitud ${textoEstado}`);
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      setMensaje(`❌ ${err.message}`);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const copiarEnlace = () => {
    const enlace = `${window.location.origin}/equipo/inscripcion/${miEquipo.id_equipo}`;
    navigator.clipboard.writeText(enlace);
    setMensaje("📋 ¡Enlace copiado al portapapeles!");
    setTimeout(() => setMensaje(""), 3000);
  };

  const toggleJugador = (id) => {
    setJugadoresSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
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

    try {
      const res = await fetch("http://localhost:3000/equipos/agregar-jugadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_equipo: equipoId,
          jugadoresIds: jugadoresSeleccionados,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al agregar jugadores");

      setJugadoresSeleccionados([]);
      setShowModal(false);
      await cargarJugadoresEquipo(equipoId);
      setMensaje("✅ Jugadores agregados");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      setMensaje(`❌ ${err.message}`);
    }
  };

  const handleEliminarJugador = async (idJugador) => {
    const equipoId = usuario.rol === 'administrador' 
      ? equipoSeleccionado?.id_equipo 
      : miEquipo?.id_equipo;

    if (!equipoId) return;

    if (usuario.rol === 'capitan' && parseInt(idJugador) === parseInt(usuario.id_usuario)) {
      setMensaje("❌ No puedes eliminarte a ti mismo");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    if (!window.confirm("¿Eliminar este jugador del equipo?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/equipos/eliminar-jugador/${equipoId}/${idJugador}`,
        { method: "DELETE", credentials: "include" }
      );

      if (!res.ok) throw new Error("Error al eliminar");

      await cargarJugadoresEquipo(equipoId);
      setMensaje("✅ Jugador eliminado");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      setMensaje(`❌ ${err.message}`);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const handleVerEquipo = async (equipo) => {
    setEquipoSeleccionado(equipo);
    await cargarJugadoresEquipo(equipo.id_equipo);
    await cargarSolicitudes(equipo.id_equipo);
  };

  if (loading) return (
    <div className="equipo-container">
      <div className="equipo-card">
        <p style={{textAlign: 'center', fontSize: '1.2rem'}}>Cargando...</p>
      </div>
    </div>
  );

  if (!usuario) return (
    <div className="equipo-container">
      <div className="equipo-card">
        <p style={{textAlign: 'center', fontSize: '1.2rem', color: '#dc3545'}}>No autorizado</p>
      </div>
    </div>
  );

  // VISTA DE INSCRIPCIÓN PÚBLICA
  if (idEquipo && equipoPublico) {
    return (
      <div className="equipo-container">
        <div className="equipo-card">
          <h2 className="equipo-title">Únete a {equipoPublico.nombre_equipo}</h2>
          <p style={{textAlign: 'center', marginBottom: '20px', color: '#666'}}>
            Capitán: {equipoPublico.nombre_capitan || "Sin asignar"}
          </p>
          
          {mensaje && <div className="mensaje">{mensaje}</div>}
          
          <button onClick={handleSolicitarInscripcion} className="agregar-btn">
            🙋 Solicitar unirme al equipo
          </button>
          
          <button onClick={() => navigate("/")} className="volver-btn" style={{marginTop: '10px', width: '100%'}}>
            ← Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // VISTA PARA CAPITÁN
  if (usuario.rol === 'capitan') {
    if (!miEquipo) {
      return (
        <div className="equipo-container">
          <form onSubmit={handleCrearEquipo} className="crear-equipo-form">
            <button type="button" onClick={() => navigate("/")} className="volver-btn">
              ← Volver
            </button>
            <h2 className="equipo-title">Crear tu equipo</h2>
            <p style={{marginBottom: '20px', color: '#666'}}>Como capitán, puedes crear un equipo y gestionar jugadores</p>
            
            <input
              type="text"
              placeholder="Nombre del equipo"
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(e.target.value)}
              required
              className="crear-equipo-input"
            />
            <button type="submit" className="crear-equipo-btn">
              Crear equipo
            </button>

            {mensaje && <div className="mensaje">{mensaje}</div>}
          </form>
        </div>
      );
    }

    return (
      <div className="equipo-container">
        <div className="equipo-card">
          <button onClick={() => navigate("/")} className="volver-btn">
            ← Volver
          </button>

          <h2 className="equipo-title">{miEquipo.nombre_equipo}</h2>
          <p style={{textAlign: 'center', marginBottom: '20px', color: '#666'}}>Panel de capitán</p>

          {mensaje && <div className="mensaje">{mensaje}</div>}

          {/* Enlace de inscripción */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.1)',
            border: '2px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{marginBottom: '10px', color: '#000000ff'}}>🔗 Enlace de inscripción</h3>
            <p style={{fontSize: '0.9rem', color: '#0a0a0aff', marginBottom: '10px'}}>
              Comparte este enlace para que jugadores soliciten unirse
            </p>
            <code style={{
              display: 'block',
              padding: '10px',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.85rem',
              wordBreak: 'break-all',
              marginBottom: '10px',
              color: 'rgba(0, 0, 0, 1)'
            }}>
              {window.location.origin}/equipo/inscripcion/{miEquipo.id_equipo}
            </code>
            <button onClick={copiarEnlace} className="agregar-btn">
              📋 Copiar enlace
            </button>
          </div>

          {/* Solicitudes pendientes */}
          {solicitudesPendientes.length > 0 && (
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '2px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 className="jugadores-title">⏳ Solicitudes pendientes ({solicitudesPendientes.length})</h3>
              <ul className="jugadores-list">
                {solicitudesPendientes.map((solicitud) => (
                  <li key={solicitud.id_solicitud} className="jugador-item">
                    <div>
                      <div className="jugador-info">{solicitud.nombre}</div>
                      <div style={{fontSize: '0.85rem', color: '#666'}}>{solicitud.email}</div>
                      <div style={{fontSize: '0.75rem', color: '#999', marginTop: '5px'}}>
                        Solicitó: {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button
                        onClick={() => handleResponderSolicitud(solicitud.id_solicitud, 'aceptada')}
                        style={{
                          background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✓ Aceptar
                      </button>
                      <button
                        onClick={() => handleResponderSolicitud(solicitud.id_solicitud, 'rechazada')}
                        className="eliminar-btn"
                      >
                        ✕ Rechazar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lista de jugadores */}
          <div className="jugadores-section">
            <h3 className="jugadores-title">👥 Jugadores del equipo ({jugadoresDelEquipo.length})</h3>
            {jugadoresDelEquipo.length === 0 ? (
              <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>
                No hay jugadores en el equipo. Acepta solicitudes o comparte el enlace de inscripción.
              </p>
            ) : (
              <ul className="jugadores-list">
                {jugadoresDelEquipo.map((jugador) => (
                  <li key={jugador.id_usuario} className="jugador-item">
                    <div className="jugador-info">
                      {jugador.nombre}
                      {parseInt(jugador.id_usuario) === parseInt(usuario.id_usuario) && (
                        <span className="capitan-badge"> (Tú - Capitán)</span>
                      )}
                    </div>
                    {parseInt(jugador.id_usuario) !== parseInt(usuario.id_usuario) && (
                      <button
                        onClick={() => handleEliminarJugador(jugador.id_usuario)}
                        className="eliminar-btn"
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VISTA PARA ADMINISTRADOR
  if (usuario.rol === 'administrador') {
    return (
      <div className="equipo-container">
        <div className="equipo-card">
          <button onClick={() => navigate("/")} className="volver-btn">
            ← Volver
          </button>

          <h2 className="equipo-title">Gestión de Equipos</h2>
          <p style={{textAlign: 'center', marginBottom: '20px', color: '#666'}}>Panel de administrador</p>

          <form onSubmit={handleCrearEquipo} style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
            <input
              type="text"
              placeholder="Nombre del nuevo equipo"
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(e.target.value)}
              required
              className="crear-equipo-input"
              style={{marginBottom: 0}}
            />
            <button type="submit" className="crear-equipo-btn" style={{width: 'auto', whiteSpace: 'nowrap'}}>
              ➕ Crear equipo
            </button>
          </form>

          {mensaje && <div className="mensaje">{mensaje}</div>}

          <div className="jugadores-section">
            <h3 className="jugadores-title">📋 Todos los equipos ({todosLosEquipos.length})</h3>
            {todosLosEquipos.length === 0 ? (
              <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>No hay equipos creados</p>
            ) : (
              <ul className="jugadores-list">
                {todosLosEquipos.map((equipo) => (
                  <li key={equipo.id_equipo} className="jugador-item">
                    <div className="jugador-info">⚽ {equipo.nombre_equipo}</div>
                    <button
                      onClick={() => handleVerEquipo(equipo)}
                      style={{
                        background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Ver/Editar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {equipoSeleccionado && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.05)',
              border: '2px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              marginTop: '20px'
            }}>
              <h3 className="jugadores-title">👥 Jugadores de {equipoSeleccionado.nombre_equipo}</h3>

              {/* Solicitudes pendientes */}
              {solicitudesPendientes.length > 0 && (
                <div style={{marginBottom: '20px'}}>
                  <h4 style={{marginBottom: '10px'}}>⏳ Solicitudes pendientes ({solicitudesPendientes.length})</h4>
                  <ul className="jugadores-list" style={{maxHeight: '150px'}}>
                    {solicitudesPendientes.map((solicitud) => (
                      <li key={solicitud.id_solicitud} className="jugador-item">
                        <div>
                          <div className="jugador-info">{solicitud.nombre}</div>
                          <div style={{fontSize: '0.85rem', color: '#666'}}>{solicitud.email}</div>
                        </div>
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button
                            onClick={() => handleResponderSolicitud(solicitud.id_solicitud, 'aceptada')}
                            style={{
                              background: '#28a745',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '15px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleResponderSolicitud(solicitud.id_solicitud, 'rechazada')}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '15px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {jugadoresDelEquipo.length === 0 ? (
                <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>
                  No hay jugadores en este equipo
                </p>
              ) : (
                <ul className="jugadores-list">
                  {jugadoresDelEquipo.map((jugador) => (
                    <li key={jugador.id_usuario} className="jugador-item">
                      <div>
                        <div className="jugador-info">{jugador.nombre}</div>
                        <div style={{fontSize: '0.85rem', color: '#666'}}>{jugador.email}</div>
                      </div>
                      <button
                        onClick={() => handleEliminarJugador(jugador.id_usuario)}
                        className="eliminar-btn"
                      >
                        🗑️ Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={() => setShowModal(true)} className="agregar-btn">
                + Agregar jugador
              </button>
            </div>
          )}

          {/* Modal para administrador */}
          {showModal && (
            <div className="modal-backdrop" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Seleccionar jugadores</h3>
                <ul className="modal-list">
                  {jugadoresDisponibles
                    .filter(j => !jugadoresDelEquipo.some(jd => 
                      parseInt(jd.id_usuario) === parseInt(j.id_usuario)
                    ))
                    .map((jugador) => (
                      <li key={jugador.id_usuario} className="modal-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={jugadoresSeleccionados.includes(jugador.id_usuario)}
                            onChange={() => toggleJugador(jugador.id_usuario)}
                          />
                          <div>
                            <div>{jugador.nombre}</div>
                            <div style={{fontSize: '0.85rem', color: '#666'}}>{jugador.email} - {jugador.rol}</div>
                          </div>
                        </label>
                      </li>
                    ))}
                </ul>
                <button onClick={handleAgregarJugadores} className="modal-agregar-btn">
                  Agregar seleccionados
                </button>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="volver-btn" 
                  style={{width: '100%', marginTop: '10px'}}
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

  // VISTA PARA JUGADOR
  if (miEquipo) {
    return (
      <div className="equipo-container">
        <div className="equipo-card">
          <button onClick={() => navigate("/")} className="volver-btn">
            ← Volver
          </button>

          <h2 className="equipo-title">{miEquipo.nombre_equipo}</h2>
          <p style={{textAlign: 'center', marginBottom: '20px', color: '#666'}}>Tu equipo</p>

          <div className="jugadores-section">
            <h3 className="jugadores-title">👥 Compañeros de equipo</h3>
            <ul className="jugadores-list">
              {jugadoresDelEquipo.map((jugador) => (
                <li key={jugador.id_usuario} className="jugador-item">
                  <div className="jugador-info">
                    {jugador.nombre}
                    {parseInt(jugador.id_usuario) === parseInt(miEquipo.id_capitan) && (
                      <span className="capitan-badge"> • Capitán</span>
                    )}
                    {parseInt(jugador.id_usuario) === parseInt(usuario.id_usuario) && (
                      <span style={{color: '#28a745', fontWeight: 'bold'}}> • (Tú)</span>
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
        <button onClick={() => navigate("/")} className="volver-btn">
          ← Volver
        </button>
        
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '2.5rem'
          }}>
            ⚽
          </div>
          <h2 className="equipo-title">Sin equipo</h2>
          <p style={{color: '#666', marginBottom: '20px'}}>
            No estás asignado a ningún equipo todavía.
          </p>
          <div style={{
            padding: '20px',
            background: 'rgba(0, 123, 255, 0.1)',
            border: '1px solid rgba(0, 123, 255, 0.3)',
            borderRadius: '15px',
            textAlign: 'left'
          }}>
            <p style={{fontSize: '0.95rem', color: '#333'}}>
              💡 <strong>¿Cómo unirte a un equipo?</strong>
              <br />
              Solicita a un capitán que te comparta el enlace de inscripción de su equipo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}