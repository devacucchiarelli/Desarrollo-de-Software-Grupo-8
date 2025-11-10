import { useEffect, useState } from 'react';
import '../styles/css/listaUsuarios.css'; // <-- 1. Importamos el nuevo CSS

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null); // <-- 2. Añadimos estado de error

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const res = await fetch('http://localhost:3000/usuarios', {
          method: 'GET',
          credentials: 'include', // ✅ enviar cookies de sesión
        });
        if (!res.ok) throw new Error('No autorizado o error al obtener usuarios');
        const data = await res.json();
        setUsuarios(data);
      } catch (err) {
        console.error(err);
        setError(err.message); // <-- 3. Seteamos el error
      }
    };

    cargarUsuarios();
  }, []);

  // 4. Mapeo de roles a clases CSS
  const getRoleClass = (rol) => {
    switch (rol) {
      case 'administrador':
        return 'role-admin';
      case 'capitan':
        return 'role-capitan';
      case 'jugador':
        return 'role-jugador';
      default:
        return 'role-default';
    }
  };

  return (
    // 5. Aplicamos clases CSS en lugar de estilos en línea
    <div className="user-list-container">
      <h2 className="user-list-title">Usuarios Registrados</h2>

      {error && <p className="error-message">{error}</p>}

      {usuarios.length > 0 ? (
        <ul className="user-list">
          {usuarios.map((u) => ( // Usamos 'u' (usuario)
            <li key={u.id_usuario} className="user-list-item">
              <div className="user-info">
                <span className="user-name">{u.nombre}</span>
                <span className="user-email">{u.email}</span>
              </div>
              <span className={`user-role-badge ${getRoleClass(u.rol)}`}>
                {u.rol}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-users-message">No se encontraron usuarios registrados.</p>
      )}

      <div className="user-list-actions">
        <a href="/registro" className="btn btn-create-user">
          Crear Nuevo Usuario
        </a>
        {/* El botón de volver ya está en el Layout, pero lo dejamos por si acaso */}
        {/* <a href="/" className="btn btn-back">
          Volver al Inicio
        </a> */}
      </div>
    </div>
  );
}