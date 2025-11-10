import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/css/listaTorneos.css';

function ListaTorneos() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarTorneos();
  }, []);

  const cargarTorneos = async () => {
    try {
      setLoading(true);
      // ✅ CORRECCIÓN: Agregar /api/ al inicio
      const response = await fetch("http://localhost:3000/api/estadisticas/torneos", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar torneos');
      const data = await response.json();
      setTorneos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const irAEstadisticas = (idTorneo) => {
    navigate(`/estadisticas/${idTorneo}`);
  };

  if (loading) {
    return (
      <div className="lista-torneos-container">
        <div className="loading-spinner">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lista-torneos-container">
        <button onClick={() => navigate('/')} className="btn-volver">← Volver</button>
        <div className="mensaje-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="lista-torneos-container">
      <button onClick={() => navigate('/')} className="btn-volver">← Volver</button>
      <h2>Estadísticas por Torneo</h2>

      {torneos.length === 0 ? (
        <div className="mensaje-vacio">No hay torneos con partidos jugados</div>
      ) : (
        <div className="torneos-grid">
          {torneos.map((torneo) => (
            <div 
              key={torneo.id_torneo} 
              className="torneo-card" 
              onClick={() => irAEstadisticas(torneo.id_torneo)}
            >
              <h3>{torneo.nombre_torneo}</h3>
              <div className="torneo-info">
                <span><strong>Tipo:</strong> {torneo.tipo_torneo}</span>
                <span><strong>Formato:</strong> {torneo.formato}</span>
                <span><strong>Partidos jugados:</strong> {torneo.partidos_jugados}</span>
                <span className="fecha-torneo">
                  {new Date(torneo.fecha_inicio).toLocaleDateString('es-AR')}
                </span>
              </div>
              <button className="btn-ver-stats">Ver Estadísticas →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListaTorneos;