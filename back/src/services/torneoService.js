const torneoModel = require('../models/torneoModel');
const partidoService = require('./partidoService'); // <-- AÑADIR ESTA LÍNEA

async function crearTorneoService(data) {
  const { nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato } = data;

  // ... (aquí va todo tu código de validación actual, no lo borres)
  if (!nombre_torneo || !fecha_inicio || !fecha_fin || !tipo_torneo || !formato) {
    throw new Error('Todos los campos son obligatorios');
  }
  const tiposValidos = ['futbol_5', 'futbol_7', 'futbol_11'];
  const formatosValidos = ['liga', 'eliminatoria'];
  if (!tiposValidos.includes(tipo_torneo)) {
    throw new Error('Tipo de torneo inválido. Debe ser: futbol_5, futbol_7 o futbol_11');
  }
  if (!formatosValidos.includes(formato)) {
    throw new Error('Formato inválido. Debe ser: liga o eliminatoria');
  }
  const inicio = new Date(fecha_inicio);
  const fin = new Date(fecha_fin);
  if (fin <= inicio) {
    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
  }
  // ... (fin del código de validación)

  const nuevoTorneo = await torneoModel.crearTorneo( // <-- CAMBIO AQUÍ
    nombre_torneo,
    fecha_inicio,
    fecha_fin,
    tipo_torneo,
    formato
  );

  // --- INICIO DE CÓDIGO AÑADIDO ---
  // Criterio de Aceptación: Generar partidos automáticamente
  if (nuevoTorneo && nuevoTorneo.id_torneo) {
    try {
      await partidoService.generarPartidosParaTorneo(nuevoTorneo.id_torneo, nuevoTorneo.formato);
    } catch (genError) {
      console.error("Error al generar partidos, pero el torneo se creó:", genError.message);
      // Decidimos si esto debe lanzar un error o no. Por ahora solo lo logueamos.
    }
  }
  // --- FIN DE CÓDIGO AÑADIDO ---

  return nuevoTorneo; // <-- CAMBIO AQUÍ
}

async function getTodosLosTorneosService() {
// ... (sin cambios)
  return await torneoModel.findAllTorneos();
}

async function eliminarTorneoService(id_torneo) {
// ... (sin cambios)
// Gracias al 'ON DELETE CASCADE' de la DB, 
// no necesitamos borrar los partidos manualmente.
  if (!id_torneo) {
    throw new Error('ID de torneo es requerido');
  }
  const torneoEliminado = await torneoModel.deleteTorneo(id_torneo);
  if (!torneoEliminado) {
    throw new Error('Torneo no encontrado');
  }
  return torneoEliminado;
}

async function editarTorneoService(id_torneo, nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato) {
// ... (sin cambios)
  const torneos = await getTodosLosTorneosService();
  const torneoExiste = torneos.find(t => t.id_torneo === parseInt(id_torneo));
  if (!torneoExiste) {
    throw new Error('Torneo no encontrado');
  }
  if (!nombre_torneo || !fecha_inicio || !fecha_fin || !tipo_torneo || !formato) {
    throw new Error('Todos los campos son requeridos');
  }
  const tiposValidos = ['futbol_5', 'futbol_7', 'futbol_11'];
  if (!tiposValidos.includes(tipo_torneo)) {
    throw new Error('Tipo de torneo inválido');
  }
  const formatosValidos = ['liga', 'eliminatoria'];
  if (!formatosValidos.includes(formato)) {
    throw new Error('Formato de torneo inválido');
  }
  return await torneoModel.editarTorneo(id_torneo, nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato);
}

module.exports = {
  crearTorneoService,
  getTodosLosTorneosService,
  eliminarTorneoService,
  editarTorneoService
};