import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../styles/css/tablaPosiciones.css'; // Usamos el CSS existente
import { getTablaPosiciones, updateNombreEquipo } from "../servicios/partidosService";

// --- NUEVO: Modal Placeholder ---
// Un modal simple que solo muestra "Editando..."
function PlaceholderEditModal({ partido, onClose }) {
  return (
    // Usamos los estilos del modal de settings que ya tenés
    <div className="settings-modal-backdrop" onClick={onClose}> 
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Editando Partido (WIP)</h2>
        <p>Aquí irá el formulario para editar el partido:</p>
        <p><strong>{partido.equipo_local || 'Equipo A'} vs {partido.equipo_visitante || 'Equipo B'}</strong></p>
        <p>Esta funcionalidad la completará otro compañero.</p>
        <button onClick={onClose} className="btn-close-modal">Cerrar</button>
      </div>
    </div>
  );
}
// --- FIN Modal Placeholder ---


// --- NUEVO: Componente MatchCard ---
const MatchCard = ({ partido, onEditClick, isAdmin }) => {
    return (
        // Hacemos clickeable la card (solo si es admin)
        <div 
          className={`match-card ${isAdmin ? 'clickable' : ''}`} 
          onClick={isAdmin ? () => onEditClick(partido) : null}
          title={isAdmin ? "Click para editar partido" : ""}
        >
            <div className="match-info">
                <span className="match-date">
                    {(partido.fecha_formato && partido.fecha_formato.split(' ')[0]) || 'Fecha TBC'}
                </span>
                <span className="match-time">
                    {(partido.fecha_formato && partido.fecha_formato.split(' ')[1]) || 'Hora TBC'}
                </span>
            </div>
            <div className="match-teams">
                <div className="team-row">
                    <span className="team-name">{partido.equipo_local || 'Equipo A'}</span>
                    <span className="team-score">{partido.resultado_local ?? '-'}</span>
                </div>
                <div className="team-row">
                    <span className="team-name">{partido.equipo_visitante || 'Equipo B'}</span>
                    <span className="team-score">{partido.resultado_visitante ?? '-'}</span>
                </div>
            </div>
            {isAdmin && (
              <div className="match-actions">
                  <span className="edit-icon">✏️</span>
              </div>
            )}
        </div>
    );
};
// --- Fin MatchCard ---


export default function TablaPosiciones({ usuario }) {
    const isAdmin = usuario?.rol === 'administrador';

    const [tabla, setTabla] = useState([]);
    const [loadingTabla, setLoadingTabla] = useState(true);
    const [error, setError] = useState(null);
    const { idTorneo } = useParams();
    const navigate = useNavigate();
    const isAdmin = usuario && usuario.rol === 'administrador';

    // --- Estados para Partidos ---
    const [partidos, setPartidos] = useState([]);
    const [loadingPartidos, setLoadingPartidos] = useState(true);
    
    // --- Estados para el Modal ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPartido, setSelectedPartido] = useState(null);
    // ---

    useEffect(() => {
        // Carga la tabla de posiciones
        const cargarTabla = async () => {
            setLoadingTabla(true);
            try {
                const response = await fetch(`http://localhost:3000/tabla/${idTorneo}`, { credentials: 'include' });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || `Error ${response.status}: No se pudo cargar la tabla`);
                }
                setTabla(data);
            } catch (err) {
                console.error("Error al cargar tabla:", err);
                setError(err.message);
            } finally {
                setLoadingTabla(false);
            }
        };

        // Carga TODOS los partidos (ya que no hay endpoint de jornadas)
        const cargarPartidos = async () => {
          setLoadingPartidos(true);
          try {
            // Usamos la misma ruta que usa Fixture.jsx
            const response = await fetch(`http://localhost:3000/partidos/${idTorneo}`, { credentials: 'include' });
            if (!response.ok) {
                throw new Error(`No se pudieron cargar los partidos`);
            }
            const data = await response.json();
            setPartidos(data);
          } catch (error) {
            console.error("Error al cargar partidos:", error);
            // No seteamos error principal si solo fallan los partidos
          } finally {
            setLoadingPartidos(false);
          }
        };

        cargarTabla();
        cargarPartidos(); // Carga las dos cosas
    }, [idTorneo]);


    // --- Manejo del Modal Placeholder ---
    const handleOpenEditModal = (partido) => {
        if (!isAdmin) return;
        setSelectedPartido(partido);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        setSelectedPartido(null);
        setShowEditModal(false);
        // Aquí es donde tu compañero agregaría la lógica para guardar y recargar
    };
    // --- Fin Modal ---

    if (loadingTabla) {
        return <div className="tabla-posiciones-container"><p>Cargando...</p></div>;
    }

    if (error) {
        return (
            <div className="tabla-posiciones-container">
                <button onClick={() => navigate('/')} className="btn-volver">← Volver</button>
                <p className="error-message">Error: {error}</p>
            </div>
        );
    }

    return (
        // --- NUEVO LAYOUT DE 2 COLUMNAS ---
        <div className="tabla-posiciones-layout">
            <button onClick={() => navigate('/')} className="btn-volver-ligas">← Volver</button>
            
            {/* Columna Izquierda: Tabla de Posiciones */}
            <div className="tabla-posiciones-col">
                <h2 className="titulo-tabla">Tabla de Posiciones</h2>
                {tabla.length === 0 ? (
                    <p>No hay equipos o partidos registrados en este torneo.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="tabla-posiciones">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>EQUIPO</th>
                                    <th>PJ</th>
                                    <th>PG</th>
                                    <th>PE</th>
                                    <th>PP</th>
                                    <th>GF</th>
                                    <th>GC</th>
                                    <th>DG</th>
                                    <th>PTS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tabla.map((equipo, index) => (
                                    <tr key={equipo.id_equipo || `placeholder-${index}`}>
                                        <td>{index + 1}</td>
                                        <td className={`nombre-equipo ${!equipo.id_equipo ? 'placeholder' : ''}`}>
                                          {equipo.nombre_equipo}
                                        </td>
                                        <td>{equipo.PJ}</td>
                                        <td>{equipo.PG}</td>
                                        <td>{equipo.PE}</td>
                                        <td>{equipo.PP}</td>
                                        <td>{equipo.GF}</td>
                                        <td>{equipo.GC}</td>
                                        <td>{equipo.DG > 0 ? `+${equipo.DG}` : equipo.DG}</td>
                                        <td className="puntos">{equipo.PTS}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Columna Derecha: Partidos por Jornada */}
            <div className="jornada-partidos-col">
                <h2 className="titulo-jornada">Partidos</h2>
                
                {/* Selector de Jornada (Placeholder) */}
                <div className="jornada-selector">
                    <button disabled className="btn-nav-jornada"><span className="arrow-icon">←</span></button>
                    <select disabled className="select-jornada">
                        <option>Jornada (Próximamente)</option>
                        {/* Tus compañeros llenarán esto desde el backend */}
                    </select>
                    <button disabled className="btn-nav-jornada"><span className="arrow-icon">→</span></button>
                </div>

                <div className="partidos-list">
                    {loadingPartidos ? (
                        <p>Cargando partidos...</p>
                    ) : partidos.length === 0 ? (
                        <p>No hay partidos para mostrar.</p>
                    ) : (
                        // Mostramos TODOS los partidos
                        partidos.map(partido => (
                            <MatchCard 
                                key={partido.id_partido} 
                                partido={partido} 
                                onEditClick={handleOpenEditModal}
                                isAdmin={isAdmin}
                            />
                        ))
                    )}
                </div>
            </div>
            {/* --- FIN COLUMNAS --- */}


            {/* Modal de edición (Placeholder) */}
            {showEditModal && selectedPartido && (
                <PlaceholderEditModal
                    partido={selectedPartido}
                    onClose={handleCloseEditModal}
                />
            )}
        </div>
    );
}