import { useState } from 'react'

export default function Registro() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'jugador'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ para mantener sesión si el backend lo setea
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al registrar usuario')

      setFormData({ nombre: '', email: '', password: '', rol: 'jugador' })
    } catch (error) {
      console.error('❌ Error en registro:', error)
      alert(error.message)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Registro de Usuario</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10 }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10 }}
        />

        <select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: 15 }}
        >
          <option value="jugador">Jugador</option>
          <option value="capitan">Capitán</option>
          <option value="administrador">Administrador</option>
        </select>

        <button
          type="submit"
          style={{
            backgroundColor: 'black',
            color: 'white',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Registrarme
        </button>
      </form>

      <a
        href="/usuarios"
        style={{
          backgroundColor: 'black',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '4px',
          textDecoration: 'none',
          display: 'inline-block',
          marginTop: '1rem',
          cursor: 'pointer',
        }}
      >
        Volver
      </a>
    </div>
  )
}
