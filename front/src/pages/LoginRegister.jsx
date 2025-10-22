import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/css/LoginRegister.css';

export default function LoginRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('usuario');
  const [mensaje, setMensaje] = useState('');
  const [isRegistro, setIsRegistro] = useState(false);

  const navigate = useNavigate(); // Hook para redirección

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3000/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      console.log("Respuesta login:", data);
      
      setMensaje('Login exitoso, bienvenido ' + data.usuario.nombre);

      // Redirigir a "/" después de login exitoso
      navigate('/');
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
