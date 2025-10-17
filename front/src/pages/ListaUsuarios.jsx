import { useEffect, useState } from 'react'

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([])

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
        setError(err.message);
      }
    };

    cargarUsuarios();
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Usuarios registrados</h2>
      <ul>
        {usuarios.map((u, i) => (
          <li key={i}>
            {u.nombre} - {u.email} - {u.rol}
          </li>
        ))}
      </ul>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px", // espacio entre los botones
          alignItems: "center", // opcional, centra horizontalmente
        }}
      >
        <a
          href="/registro"
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          Crear nuevo usuario
        </a>

        <a
          href="/"
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          Volver
        </a>
      </div>

    </div>
  )
}
