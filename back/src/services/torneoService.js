const torneoModel = require('../models/torneoModel');
const partidoService = require('./partidoService');

// --- crearTorneoService (ACTUALIZADO CON LIGA Y ELIMINATORIA) ---
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

  let equiposParaGuardar = null;

  if (formato === 'eliminatoria') {
    if (!cantidad_equipos || ![8, 16, 32].includes(cantidad_equipos)) {
      throw new Error('Para formato Eliminatoria, la cantidad de equipos debe ser 8, 16 o 32.');
    }
    equiposParaGuardar = cantidad_equipos;
  } else if (formato === 'liga') {
    if (!cantidad_equipos || cantidad_equipos < 4 || cantidad_equipos > 30) {
        throw new Error('Para formato Liga, la cantidad de equipos debe ser entre 4 y 30.');
    }
    equiposParaGuardar = cantidad_equipos;
  }
  // --- FIN VALIDACIONES ---

  const nuevoTorneo = await torneoModel.crearTorneo(
    nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato, equiposParaGuardar
  );

  // Generar partidos según el formato
  if (nuevoTorneo && nuevoTorneo.id_torneo) {
    try {
      if (nuevoTorneo.formato === 'eliminatoria' && equiposParaGuardar) {
        await partidoService.generarPartidosParaTorneo(nuevoTorneo.id_torneo, equiposParaGuardar);
        console.log(`Partidos de eliminatoria generados para torneo ${nuevoTorneo.id_torneo}`);
      } else if (nuevoTorneo.formato === 'liga' && equiposParaGuardar) {
        await partidoService.generarPartidosLiga(nuevoTorneo.id_torneo, equiposParaGuardar, fecha_inicio, fecha_fin);
        console.log(`Fixture de liga generado para torneo ${nuevoTorneo.id_torneo} con ${equiposParaGuardar} equipos`);
      }
    } catch (genError) { 
      console.error("Error al generar partidos:", genError.message); 
      throw new Error(`Torneo creado pero falló la generación de partidos: ${genError.message}`);
    }
  }

  return nuevoTorneo;
}


async function getTodosLosTorneosService() {
   return await torneoModel.findAllTorneos();
}

async function eliminarTorneoService(id_torneo) {
  if (!id_torneo) { throw new Error('ID de torneo es requerido'); } 
  const torneoEliminado = await torneoModel.deleteTorneo(id_torneo); 
  if (!torneoEliminado) { throw new Error('Torneo no encontrado'); } 
  return torneoEliminado;
}

async function editarTorneoService(id_torneo, data) {
    const { nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato, cantidad_equipos } = data;
    const idTorneoInt = parseInt(id_torneo, 10);

    const torneoActual = await torneoModel.findTorneoById(idTorneoInt);
    if (!torneoActual) { throw new Error('Torneo no encontrado'); }

    if (!nombre_torneo || !fecha_inicio || !fecha_fin || !tipo_torneo ) { 
      throw new Error('Nombre, fechas y tipo son requeridos'); 
    }
    const tiposValidos = ['futbol_5', 'futbol_7', 'futbol_11'];
    if (!tiposValidos.includes(tipo_torneo)) { throw new Error('Tipo de torneo inválido'); }

    let formatoFinal = torneoActual.formato;
    let cantidadFinal = torneoActual.cantidad_equipos;

    // Solo permitir cambiar formato y cantidad si el torneo NO ERA eliminatoria
    if (torneoActual.formato !== 'eliminatoria') {
        const formatosValidos = ['liga', 'eliminatoria'];
        if (!formatosValidos.includes(formato)) { throw new Error('Formato inválido.'); }
        formatoFinal = formato;

        if (formatoFinal === 'eliminatoria') {
             if (!cantidad_equipos || ![8, 16, 32].includes(cantidad_equipos)) { 
               throw new Error('Si cambias a Eliminatoria, la cantidad debe ser 8, 16 o 32.'); 
             }
             cantidadFinal = cantidad_equipos;
        } else if (formatoFinal === 'liga') {
             if (!cantidad_equipos || cantidad_equipos < 4 || cantidad_equipos > 30) { 
               throw new Error('Para Liga, equipos debe ser entre 4 y 30.'); 
             }
             cantidadFinal = cantidad_equipos;
        } else {
             cantidadFinal = null;
        }
    } 

    const torneoActualizado = await torneoModel.editarTorneo(
        idTorneoInt, nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo,
        formatoFinal, cantidadFinal
    );

    return torneoActualizado;
}


module.exports = {
  crearTorneoService,
  getTodosLosTorneosService,
  eliminarTorneoService,
  editarTorneoService
};