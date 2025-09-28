import { useEffect, useState } from 'react'

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    fetch('http://localhost:3000/api/usuarios')
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error(err))
  }, [])

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
    </div>
  )
}
