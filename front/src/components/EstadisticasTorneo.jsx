
import { useEffect, useState } from "react";
import { getEstadisticas, putEstadisticas } from "../servicios/estadisticasService";
import "../styles/estadisticas.css";

export default function EstadisticasTorneo({ idTorneo = 1, isAdmin = false }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      setError("");
      setLoading(true);
      const data = await getEstadisticas(idTorneo); // GET público
      setStats(data);
    } catch (e) {
      setError("No se pudieron cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  }

  async function recalcular() {
    try {
      setSaving(true);
      const data = await putEstadisticas(idTorneo); // PUT protegido (cookie)
      setStats(data);
    } catch (e) {
      setError("No se pudo actualizar (requiere sesión válida)");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => { cargar(); }, [idTorneo]);

  // evita panel vacío en 1ª carga
  if (loading && !stats) return null;

  return (
    <section className="panel-card">
      <header className="panel-head">
        <div>
          <h3 className="panel-title">Estadísticas del Torneo</h3>
          <p className="panel-subtitle">Torneo #{idTorneo}</p>
        </div>

        <div className="panel-actions">
          <button className="btn-secondary" onClick={cargar} disabled={loading}>
            {loading ? "Actualizando…" : "Refrescar"}
          </button>
          {isAdmin && (
            <button className="btn-primary" onClick={recalcular} disabled={saving}>
              {saving ? "Guardando…" : "Recalcular y guardar"}
            </button>
          )}
        </div>
      </header>

      <div className="panel-body">
        {error && <div className="alert-error">{error}</div>}

        {!stats && !error && <div className="skeleton" aria-label="cargando" />}

        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Equipos</span>
                <span className="stat-value">{stats.equipos}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Partidos</span>
                <span className="stat-value">{stats.partidos}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Goles</span>
                <span className="stat-value">{stats.goles}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Amarillas</span>
                <span className="stat-value">{stats.amarillas}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Rojas</span>
                <span className="stat-value">{stats.rojas}</span>
              </div>
            </div>

            <footer className="panel-foot">
              <small>Última actualización: {new Date(stats.actualizadoA).toLocaleString()}</small>
            </footer>
          </>
        )}
      </div>
    </section>
  );
}
