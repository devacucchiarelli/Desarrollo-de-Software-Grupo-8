import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/css/LoginRegister.css';

export default function LoginRegister({ onLoginSuccess, usuario }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('jugador'); // ← CAMBIO AQUÍ: de 'usuario' a 'jugador'
  const [mensaje, setMensaje] = useState('');
  const [isRegistro, setIsRegistro] = useState(false);

  const navigate = useNavigate();

  // Redirigir si ya está logueado
  useEffect(() => {
    if (usuario) {
      navigate('/');
    }
  }, [usuario, navigate]);

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3000/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      console.log("Respuesta login:", data);
      
      setMensaje('Login exitoso, bienvenido ' + data.usuario.nombre);

      // Llamar a la función para actualizar el estado de autenticación
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Redirigir a "/" después de login exitoso
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const handleRegistro = async () => {
    try {
      const res = await fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, email, password, rol }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensaje('Registro exitoso, ahora podés iniciar sesión');
      setIsRegistro(false);
    } catch (err) {
      setMensaje(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistro ? 'Registro' : 'Login'}</h2>

      {isRegistro && (
        <>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="capitan">Capitán</option>
            <option value="jugador">Jugador</option>
            <option value="administrador">Administrador</option>
          </select>
        </>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {isRegistro ? (
        <button onClick={handleRegistro}>Registrarse</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}

      <p className="toggle" onClick={() => setIsRegistro(!isRegistro)}>
        {isRegistro ? 'Ya tengo cuenta, quiero login' : 'No tengo cuenta, quiero registrarme'}
      </p>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
}