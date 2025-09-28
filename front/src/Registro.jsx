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
    const response = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al registrar usuario')

    alert('Usuario registrado correctamente')
    setFormData({ nombre: '', email: '', password: '', rol: 'jugador' })
    } catch (error) {
    alert(error.message)
    }
  }


  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} /><br />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} /><br />
        <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} /><br />
        <select name="rol" value={formData.rol} onChange={handleChange}>
          <option value="jugador">Jugador</option>
          <option value="capitan">Capitán</option>
          <option value="administrador">Administrador</option>
        </select>
        <br />
        <button type="submit">Registrarme</button>
      </form>
    </div>
  )
}
