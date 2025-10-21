import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../styles/css/fixture.css'; // Crearemos este archivo

export default function Fixture({ isAdmin }) {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { idTorneo } = useParams(); // Obtiene el ID del torneo desde la URL
  const navigate = useNavigate();

  useEffect(() => {
    cargarPartidos();
  }, [idTorneo]);

  const cargarPartidos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/partidos/${idTorneo}`, {
        credentials: 'include', // Envía cookies (para futuras acciones de admin)
      });
      if (!response.ok) throw new Error('Error al cargar el fixture');
      const data = await response.json();
      setPartidos(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (partido) => {
    // Lógica para editar un partido (Criterio de Aceptación)
    // Por ahora, un simple prompt. Idealmente, abriría un modal.
    const nuevaFecha = prompt("Editar fecha (DD/MM/YYYY HH:MI):", partido.fecha_formato);
    if (nuevaFecha) {
      // Aquí iría una petición PUT a /partidos/:idPartido
      alert(`(Simulación) Partido ${partido.id_partido} editado. Nueva fecha: ${nuevaFecha}. \n¡Implementa la lógica PUT!`);
    }
  };

  const handleDelete = async (idPartido) => {
    // Lógica para eliminar un partido (Criterio de Aceptación)
    if (window.confirm("¿Seguro que querés eliminar este partido?")) {
      try {
        const response = await fetch(`http://localhost:3000/partidos/${idPartido}`, {
          method: 'DELETE',
          credentials: 'include', // Necesario para que el backend verifique el token
        });
        if (!response.ok) throw new Error('No tenés permiso para eliminar este partido');
        // Recargar la lista de partidos
        cargarPartidos(); 
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) return <div className="fixture-container"><p>Cargando fixture...</p></div>;
  if (error) return <div className="fixture-container"><p>Error: {error}</p></div>;

  return (
    <div className="fixture-container">
      <button onClick={() => navigate('/')} className="btn-volver">
        ← Volver
      </button>
      <h2>Fixture del Torneo</h2>
      
      {partidos.length === 0 ? (
        <p>No hay partidos generados para este torneo.</p>
      ) : (
        <ul className="fixture-lista">
          {partidos.map((partido) => (
            <li key={partido.id_partido} className="partido-item">
              <div className="partido-info">
                <span className="partido-fecha">{partido.fecha_formato}</span>
                <div className="partido-equipos">
                  <span className="equipo-local">{partido.equipo_local}</span>
                  <span className="partido-resultado">
                    {partido.resultado_local} - {partido.resultado_visitante}
                  </span>
                  <span className="equipo-visitante">{partido.equipo_visitante}</span>
                </div>
              </div>
              {isAdmin && (
                <div className="partido-acciones">
                  <button onClick={() => handleEdit(partido)} className="btn-editar">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(partido.id_partido)} className="btn-eliminar">
                    🗑️
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}