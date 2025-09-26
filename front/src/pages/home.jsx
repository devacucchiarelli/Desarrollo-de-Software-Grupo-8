import { useState } from "react";

function Home({ isAdmin }) {
  const [torneo, setTorneo] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
    formato: "",
    tipo: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTorneo(formData);
    setMostrarForm(false);
    setEditando(false);
    setFormData({ nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "" });
  };

  const handleEdit = () => {
    setFormData(torneo);
    setEditando(true);
    setMostrarForm(true);
  };

  const handleDelete = () => {
    setTorneo(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          🏆 Gestión de Torneos
        </h1>

        {torneo ? (
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
            <h2 className="text-2xl font-bold text-blue-600">{torneo.nombre}</h2>
            <p className="text-gray-600 mt-2">
              📅 {torneo.fechaInicio} → {torneo.fechaFin}
            </p>
            <p className="text-gray-600">⚽ {torneo.tipo}</p>
            <p className="text-gray-600">📋 Formato: {torneo.formato}</p>

            {isAdmin && (
              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg shadow-md transition"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition"
                >
                  🗑 Eliminar
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
            <p className="text-gray-600">No hay ningún torneo activo.</p>
            {isAdmin && !mostrarForm && (
              <button
                onClick={() => setMostrarForm(true)}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition"
              >
                ➕ Crear Torneo
              </button>
            )}
          </div>
        )}

        {isAdmin && mostrarForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-lg rounded-2xl p-6 mt-6 space-y-4"
          >
            <h2 className={`text-2xl font-bold ${editando ? "text-yellow-500" : "text-green-600"}`}>
              {editando ? "✏️ Editar Torneo" : "➕ Crear Torneo"}
            </h2>

            <input
              type="text"
              name="nombre"
              placeholder="Nombre del torneo"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <input
              type="date"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <input
              type="date"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <input
              type="text"
              name="tipo"
              placeholder="Ej: Fútbol 7"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <input
              type="text"
              name="formato"
              placeholder="Ej: Liga, Eliminación"
              value={formData.formato}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            <button
              type="submit"
              className={`w-full py-2 font-bold rounded-lg shadow-md transition ${
                editando
                  ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {editando ? "Guardar Cambios" : "Guardar Torneo"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Home;
