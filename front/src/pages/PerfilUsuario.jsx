import { useEffect, useState } from "react";

function PerfilUsuario() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/usuarios/perfil", {
      credentials: "include", // para enviar cookies (token)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener perfil");
        return res.json();
      })
      .then((data) => {
        setPerfil(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!perfil) return <p>No se encontraron datos del perfil.</p>;

  const { usuario, torneos, estadisticas } = perfil;

  return (
    <div className="perfil-container">
      <h2>Perfil del Usuario</h2>
      <div className="perfil-info">
        <p><strong>Nombre:</strong> {usuario.nombre}</p>
        <p><strong>Email:</strong> {usuario.email}</p>
        <p><strong>Rol:</strong> {usuario.rol}</p>
        {usuario.nombre_equipo ? (
          <p><strong>Equipo:</strong> {usuario.nombre_equipo}</p>
        ) : (
          <p><strong>Equipo:</strong> No pertenece a ningún equipo</p>
        )}
        {usuario.es_capitan && <p>⭐ Eres el capitán de tu equipo</p>}
      </div>

      <h3>Estadísticas globales</h3>
      <ul>
        <li>Partidos jugados: {estadisticas.partidos_jugados || 0}</li>
        <li>Goles: {estadisticas.goles || 0}</li>
        <li>Amarillas: {estadisticas.amarillas || 0}</li>
        <li>Rojas: {estadisticas.rojas || 0}</li>
      </ul>

      <h3>Torneos en los que participa</h3>
      {torneos.length > 0 ? (
        <ul>
          {torneos.map((t) => (
            <li key={t.id_torneo}>
              <a href={`/torneo/${t.id_torneo}/tabla`}>
                {t.nombre_torneo} ({t.tipo_torneo}, {t.formato})
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No está inscrito en ningún torneo.</p>
      )}
    </div>
  );
}

export default PerfilUsuario;
