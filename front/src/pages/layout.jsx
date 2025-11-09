import React, { useState, useEffect } from 'react'; // <-- AÑADIR useState, useEffect
import { Outlet, Link } from 'react-router-dom';

// --- NUEVO: Componente del Modal de Ajustes ---
function SettingsModal({
  onClose,
  musicVolume,
  onVolumeChange,
  isMusicMuted,
  onMuteToggle
}) {
  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Configuración de Sonido</h2>
        
        {/* Sección de Música */}
        <div className="settings-section">
          <h3>Música</h3>
          <div className="settings-row">
            <label>Volumen</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={musicVolume} 
              onChange={onVolumeChange}
              className="volume-slider"
            />
            <button onClick={onMuteToggle} className="btn-mute">
              {isMusicMuted ? 'Activar' : 'Mutear'}
            </button>
          </div>
        </div>

        <button onClick={onClose} className="btn-close-modal">Cerrar</button>
      </div>
    </div>
  );
}
// --- FIN Componente Modal ---


export default function Layout({ usuario, onLogout }) {
  
  // --- NUEVO: Estados para los ajustes ---
  const [showSettings, setShowSettings] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5); // 50% volumen
  const [isMusicMuted, setIsMusicMuted] = useState(true); // Empieza muteado (importante)
  // --- FIN NUEVO ---

  // --- NUEVO: Efecto para aplicar los cambios al audio ---
  useEffect(() => {
    const audio = document.getElementById('background-music');
    if (!audio) return;

    audio.volume = musicVolume;
    audio.muted = isMusicMuted;
    
    // Si intentamos desmutear Y el audio está pausado (por el navegador),
    // intentamos darle play.
    if (!isMusicMuted && audio.paused) {
        audio.play().catch(e => console.log("El usuario debe interactuar para iniciar audio."));
    }
  }, [musicVolume, isMusicMuted]); // Se ejecuta si cambia el volumen o el mute

  // --- NUEVO: Handlers para el modal ---
  const handleVolumeChange = (e) => {
    setMusicVolume(e.target.value);
  };

  const handleToggleMusicMute = () => {
    // Cambiamos el estado, y el useEffect se encargará de aplicarlo
    setIsMusicMuted(!isMusicMuted);
  };
  // --- FIN NUEVO ---

  return (
    <>
      <header className="app-header">
        <div className="header-logo fade-in-header">
          <Link to="/">TORNEO</Link>
        </div>
        <nav className="header-nav fade-in-header">
          <Link to="/torneo" className="btn">Torneos</Link>
          <Link to="/equipo" className="btn">Equipo</Link>
          <Link to="/torneos" className="btn">Estadísticas</Link>
          
          {usuario ? (
            <>
              {usuario.rol === 'administrador' && (
                <Link to="/usuarios" className="btn">Usuarios</Link>
              )}
              <span className="btn btn-welcome">¡Hola, {usuario.rol}!</span>

              {/*Botón "Mi perfil" */}
              <Link to="/perfil" className="btn">Mi Perfil</Link>

              <button onClick={onLogout} className="btn btn-login">Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-login">Login</Link>
          )}

          {/* --- BOTÓN DE AJUSTES AÑADIDO --- */}
          <button onClick={() => setShowSettings(true)} className="btn-settings" title="Ajustes de sonido">
            ⚙️
          </button>
          {/* --- FIN BOTÓN --- */}

        </nav>
      </header>

      <Outlet /> 

      {/* --- RENDER MODAL CONDICIONAL --- */}
      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          musicVolume={musicVolume}
          onVolumeChange={handleVolumeChange}
          isMusicMuted={isMusicMuted}
          onMuteToggle={handleToggleMusicMute}
        />
      )}
      {/* --- FIN RENDER MODAL --- */}
    </>
  );
}