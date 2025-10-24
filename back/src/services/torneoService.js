const torneoModel = require('../models/torneoModel');
const partidoService = require('./partidoService'); // Mantenemos para 'eliminatoria'

// --- crearTorneoService (ACTUALIZADO CON VALIDACIÓN LIGA) ---
async function crearTorneoService(data) {
  const { nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato, cantidad_equipos } = data;

  // --- VALIDACIONES ---
  if (!nombre_torneo || !fecha_inicio || !fecha_fin || !tipo_torneo || !formato) {
    throw new Error('Todos los campos son obligatorios');
  }
  const tiposValidos = ['futbol_5', 'futbol_7', 'futbol_11'];
  const formatosValidos = ['liga', 'eliminatoria'];
  if (!tiposValidos.includes(tipo_torneo)) { throw new Error('Tipo de torneo inválido.'); }
  if (!formatosValidos.includes(formato)) { throw new Error('Formato inválido.'); }
  const inicio = new Date(fecha_inicio); const fin = new Date(fecha_fin);
  if (fin <= inicio) { throw new Error('La fecha de fin debe ser posterior a la fecha de inicio'); }

  let equiposParaGuardar = null; // Valor por defecto

  if (formato === 'eliminatoria') {
    if (!cantidad_equipos || ![8, 16, 32].includes(cantidad_equipos)) {
      throw new Error('Para formato Eliminatoria, la cantidad de equipos debe ser 8, 16 o 32.');
    }
    equiposParaGuardar = cantidad_equipos;
  } else if (formato === 'liga') {
    // --- VALIDACIÓN CANTIDAD PARA LIGA ---
    if (!cantidad_equipos || cantidad_equipos < 4 || cantidad_equipos > 30) {
        throw new Error('Para formato Liga, la cantidad de equipos debe ser entre 4 y 30.');
    }
    equiposParaGuardar = cantidad_equipos; // Guardamos también para liga
    // --- FIN VALIDACIÓN LIGA ---
  }
  // --- FIN VALIDACIONES ---

  // Llamamos a crearTorneo en el modelo, pasando la cantidad (puede ser null si no aplica)
  const nuevoTorneo = await torneoModel.crearTorneo(
    nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato, equiposParaGuardar
  );

  // Generar partidos SÓLO si es Eliminatoria
  if (nuevoTorneo && nuevoTorneo.id_torneo && nuevoTorneo.formato === 'eliminatoria' && equiposParaGuardar) {
    try {
      await partidoService.generarPartidosParaTorneo(nuevoTorneo.id_torneo, equiposParaGuardar);
      console.log(`Fixture de eliminatoria generado para torneo ${nuevoTorneo.id_torneo}`);
    } catch (genError) { console.error("Error al generar partidos:", genError.message); /* Considerar manejo de error */ }
  } else if (nuevoTorneo && nuevoTorneo.formato === 'liga') {
      console.log(`Torneo ${nuevoTorneo.id_torneo} creado como Liga con ${equiposParaGuardar} equipos. No se generan partidos automáticamente.`);
      // Podríamos llamar a una función diferente aquí si quisiéramos generar partidos de liga
  }

  return nuevoTorneo;
}


async function getTodosLosTorneosService() {
  // Asegúrate que findAllTorneos en torneoModel devuelva cantidad_equipos
   return await torneoModel.findAllTorneos();
}

async function eliminarTorneoService(id_torneo) {
  // Sin cambios
  if (!id_torneo) { throw new Error('ID de torneo es requerido'); } const torneoEliminado = await torneoModel.deleteTorneo(id_torneo); if (!torneoEliminado) { throw new Error('Torneo no encontrado'); } return torneoEliminado;
}

// --- editarTorneoService (ACTUALIZADO CON VALIDACIÓN LIGA) ---
async function editarTorneoService(id_torneo, data) {
    const { nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato, cantidad_equipos } = data;
    const idTorneoInt = parseInt(id_torneo, 10);

    const torneoActual = await torneoModel.findTorneoById(idTorneoInt);
    if (!torneoActual) { throw new Error('Torneo no encontrado'); }

    // Validar datos básicos
    if (!nombre_torneo || !fecha_inicio || !fecha_fin || !tipo_torneo ) { throw new Error('Nombre, fechas y tipo son requeridos'); }
    const tiposValidos = ['futbol_5', 'futbol_7', 'futbol_11'];
    if (!tiposValidos.includes(tipo_torneo)) { throw new Error('Tipo de torneo inválido'); }
    // Podrías añadir validación de fechas aquí

    let formatoFinal = torneoActual.formato;
    let cantidadFinal = torneoActual.cantidad_equipos;

    // Solo permitir cambiar formato y cantidad si el torneo NO ERA eliminatoria
    if (torneoActual.formato !== 'eliminatoria') {
        const formatosValidos = ['liga', 'eliminatoria'];
        if (!formatosValidos.includes(formato)) { throw new Error('Formato inválido.'); }
        formatoFinal = formato; // Permitir cambio de formato

        if (formatoFinal === 'eliminatoria') {
             if (!cantidad_equipos || ![8, 16, 32].includes(cantidad_equipos)) { throw new Error('Si cambias a Eliminatoria, la cantidad debe ser 8, 16 o 32.'); }
             cantidadFinal = cantidad_equipos;
             // NOTA: No regeneramos fixture al cambiar A eliminatoria en edición.
             console.log(`Torneo ${idTorneoInt} cambiado a Eliminatoria (${cantidadFinal} equipos).`);
        } else if (formatoFinal === 'liga') {
             // --- VALIDACIÓN CANTIDAD LIGA AL EDITAR ---
             if (!cantidad_equipos || cantidad_equipos < 4 || cantidad_equipos > 30) { throw new Error('Para Liga, equipos debe ser entre 4 y 30.'); }
             cantidadFinal = cantidad_equipos; // Permitir cambiar cantidad en liga
             // --- FIN VALIDACIÓN LIGA ---
        } else {
             cantidadFinal = null; // Si fuera otro formato hipotético
        }

        // Si se cambió DE Liga A Eliminatoria (raro, pero posible si no era eliminatoria antes)
        // O si se cambió A Liga desde otro formato (no eliminatoria)
        // No hacemos nada con los partidos por ahora. Si hubiera partidos de liga previos, se mantendrían.
        // Si se cambia a Eliminatoria, NO se generan partidos.

    } else {
        // Si ERA eliminatoria, ignoramos cambios de formato/cantidad
        console.log(`Torneo ${idTorneoInt} es Eliminatoria, ignorando cambios de formato/cantidad.`);
        // formatoFinal y cantidadFinal ya tienen los valores originales
    }

    const torneoActualizado = await torneoModel.editarTorneo(
        idTorneoInt, nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo,
        formatoFinal, cantidadFinal
    );

    return torneoActualizado;
}
// --- FIN editarTorneoService ---


module.exports = {
  crearTorneoService,
  getTodosLosTorneosService,
  eliminarTorneoService,
  editarTorneoService
};