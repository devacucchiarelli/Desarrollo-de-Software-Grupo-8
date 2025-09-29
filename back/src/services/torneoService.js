const torneoModel = require('../models/torneoModel');

async function crearTorneoService(data) {
  const { nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato } = data;

  // Validaciones
  if (!nombre_torneo || !fecha_inicio || !fecha_fin || !tipo_torneo || !formato) {
    throw new Error('Todos los campos son obligatorios');
  }

  // Validar tipos válidos
  const tiposValidos = ['futbol_5', 'futbol_7', 'futbol_11'];
  const formatosValidos = ['liga', 'eliminatoria'];

  if (!tiposValidos.includes(tipo_torneo)) {
    throw new Error('Tipo de torneo inválido. Debe ser: futbol_5, futbol_7 o futbol_11');
  }

  if (!formatosValidos.includes(formato)) {
    throw new Error('Formato inválido. Debe ser: liga o eliminatoria');
  }

  // Validar fechas
  const inicio = new Date(fecha_inicio);
  const fin = new Date(fecha_fin);

  if (fin <= inicio) {
    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
  }

  return await torneoModel.crearTorneo(
    nombre_torneo,
    fecha_inicio,
    fecha_fin,
    tipo_torneo,
    formato
  );
}

async function getTodosLosTorneosService() {
  return await torneoModel.findAllTorneos();
}

async function eliminarTorneoService(id_torneo) {
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
  // Validar que el torneo existe
  const torneos = await getTodosLosTorneosService();
  const torneoExiste = torneos.find(t => t.id_torneo === parseInt(id_torneo));
  
  if (!torneoExiste) {
    throw new Error('Torneo no encontrado');
  }

  // Validar campos requeridos
  if (!nombre_torneo || !fecha_inicio || !fecha_fin || !tipo_torneo || !formato) {
    throw new Error('Todos los campos son requeridos');
  }

  // Validar que fecha_fin sea posterior a fecha_inicio
 
  // Validar tipo_torneo
  const tiposValidos = ['futbol_5', 'futbol_7', 'futbol_11'];
  if (!tiposValidos.includes(tipo_torneo)) {
    throw new Error('Tipo de torneo inválido');
  }

  // Validar formato
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