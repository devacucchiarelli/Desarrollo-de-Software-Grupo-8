import { Link, useNavigate, Outlet } from "react-router-dom";

function Layout({ usuario, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  // Helper para verificar roles
  const isAdmin = usuario?.rol === 'administrador';
  const isCapitan = usuario?.rol === 'capitan';
  const isJugador = usuario?.rol === 'jugador';

  return (
    <>
      <header className="app-header">
        <div className="header-logo">
          <Link to="/">TORNEO</Link>
        </div>
        <nav className="header-nav">
          <Link to="/torneo" className="btn">Torneos</Link>
          <Link to="/equipo" className="btn">Equipo</Link>
          <Link to="/estadisticas" className="btn">Estadísticas</Link>
          
          {/* Solo mostrar "Usuarios" si es admin */}
          {isAdmin && (
            <Link to="/usuarios" className="btn">Usuarios</Link>
          )}
          
          {/* Mostrar según el rol */}
          {usuario ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'white' }}>
                Hola, {usuario.nombre} 
                {usuario.rol === 'administrador' && ' (Admin)'}
                {usuario.rol === 'capitan' && ' (Capitán)'}
                {usuario.rol === 'jugador' && ' (Jugador)'}
              </span>
              <button onClick={handleLogout} className="btn btn-login">
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-login">Login</Link>
          )}
        </nav>
      </header>
      
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;