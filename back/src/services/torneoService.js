const torneoModel = require('../models/torneoModel');
const partidoService = require('./partidoService'); // Lo mantenemos para crear

// --- crearTorneoService (Sin cambios respecto a la versión anterior) ---
// Sigue guardando cantidad_equipos en la DB si es eliminatoria
// y llamando a generarPartidosParaTorneo
async function crearTorneoService(data) {
  const { nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato, cantidad_equipos } = data;
  if (!nombre_torneo || !fecha_inicio || !fecha_fin || !tipo_torneo || !formato) { throw new Error('Todos los campos son obligatorios'); }
  const tiposValidos = ['futbol_5', 'futbol_7', 'futbol_11']; const formatosValidos = ['liga', 'eliminatoria'];
  if (!tiposValidos.includes(tipo_torneo)) { throw new Error('Tipo de torneo inválido.'); }
  if (!formatosValidos.includes(formato)) { throw new Error('Formato inválido.'); }
  const inicio = new Date(fecha_inicio); const fin = new Date(fecha_fin);
  if (fin <= inicio) { throw new Error('La fecha de fin debe ser posterior a la fecha de inicio'); }
  let equiposParaGuardar = null;
  if (formato === 'eliminatoria') {
    if (!cantidad_equipos || ![8, 16, 32].includes(cantidad_equipos)) { throw new Error('Para formato Eliminatoria, la cantidad de equipos debe ser 8, 16 o 32.'); }
    equiposParaGuardar = cantidad_equipos;
  }
  const nuevoTorneo = await torneoModel.crearTorneo( nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato, equiposParaGuardar );
  if (nuevoTorneo && nuevoTorneo.id_torneo && nuevoTorneo.formato === 'eliminatoria' && equiposParaGuardar) {
    try { await partidoService.generarPartidosParaTorneo(nuevoTorneo.id_torneo, equiposParaGuardar); }
    catch (genError) { console.error("Error al generar partidos:", genError.message); /* Considerar manejo de error */ }
  }
  return nuevoTorneo;
}


async function getTodosLosTorneosService() {
  // Sin cambios, sigue devolviendo cantidad_equipos si existe
   return await torneoModel.findAllTorneos();
}

async function eliminarTorneoService(id_torneo) {
  // Sin cambios
  if (!id_torneo) { throw new Error('ID de torneo es requerido'); } const torneoEliminado = await torneoModel.deleteTorneo(id_torneo); if (!torneoEliminado) { throw new Error('Torneo no encontrado'); } return torneoEliminado;
}

// --- editarTorneoService (SIMPLIFICADO) ---
async function editarTorneoService(id_torneo, data) {
    const { nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato, cantidad_equipos } = data; // Recibimos todo del frontend
    const idTorneoInt = parseInt(id_torneo, 10);

    // 1. Obtener torneo actual para verificar existencia y formato original
    const torneoActual = await torneoModel.findTorneoById(idTorneoInt);
    if (!torneoActual) {
        throw new Error('Torneo no encontrado');
    }

    // 2. Validar datos básicos (nombre, fechas, tipo)
    if (!nombre_torneo || !fecha_inicio || !fecha_fin || !tipo_torneo ) { // Ya no validamos formato/cantidad aquí
        throw new Error('Nombre, fechas y tipo son requeridos');
    }
    const tiposValidos = ['futbol_5', 'futbol_7', 'futbol_11'];
    if (!tiposValidos.includes(tipo_torneo)) { throw new Error('Tipo de torneo inválido'); }
    // Podríamos añadir validación de fechas aquí también si es necesario

    // 3. Determinar qué datos actualizar en la DB
    // SIEMPRE actualizamos nombre, fechas, tipo.
    // SOLO actualizamos formato y cantidad_equipos si el torneo NO ERA de eliminatoria originalmente.
    let formatoFinal = torneoActual.formato; // Por defecto, mantenemos el original
    let cantidadFinal = torneoActual.cantidad_equipos; // Por defecto, mantenemos la original

    if (torneoActual.formato !== 'eliminatoria') {
        // Si el torneo original NO ERA eliminatoria, SÍ permitimos cambiar el formato y cantidad
        const formatosValidos = ['liga', 'eliminatoria'];
        if (!formatosValidos.includes(formato)) { throw new Error('Formato inválido.'); }
        formatoFinal = formato; // Usamos el formato enviado

        if (formatoFinal === 'eliminatoria') {
             if (!cantidad_equipos || ![8, 16, 32].includes(cantidad_equipos)) {
                 throw new Error('Si cambias a Eliminatoria, la cantidad de equipos debe ser 8, 16 o 32.');
             }
             cantidadFinal = cantidad_equipos;
             // IMPORTANTE: Si se cambia A eliminatoria, ¿deberíamos generar el fixture aquí?
             // Por simplicidad, por ahora NO lo hacemos. El fixture solo se genera al CREAR.
             // Si se cambia a eliminatoria después, no tendrá partidos automáticamente.
             console.log(`Torneo ${idTorneoInt} cambiado a formato Eliminatoria (${cantidadFinal} equipos). Fixture NO se regenera automáticamente en edición.`);
        } else {
             // Si se cambia a LIGA (o se mantiene LIGA), nos aseguramos que cantidad sea NULL
             cantidadFinal = null;
        }
    } else {
        // Si el torneo original ERA eliminatoria, IGNORAMOS cualquier cambio en formato/cantidad enviado
        console.log(`Torneo ${idTorneoInt} es Eliminatoria, ignorando cambios de formato/cantidad en edición.`);
        // formatoFinal y cantidadFinal ya tienen los valores originales del torneoActual
    }


    // 4. Actualizar el torneo en la base de datos con los valores finales
    const torneoActualizado = await torneoModel.editarTorneo(
        idTorneoInt, nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo,
        formatoFinal, // Usamos el formato decidido
        cantidadFinal // Usamos la cantidad decidida (puede ser null)
    );

    return torneoActualizado;
}
// --- FIN editarTorneoService SIMPLIFICADO ---


module.exports = {
  crearTorneoService,
  getTodosLosTorneosService,
  eliminarTorneoService,
  editarTorneoService
};