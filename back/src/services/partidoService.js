const partidoModel = require('../models/partidoModel');

// --- ELIMINATORIA: Lógica de generación de fixture ---
async function generarPartidosParaTorneo(id_torneo, cantidad_equipos) {
  if (![8, 16, 32].includes(cantidad_equipos)) {
      throw new Error("La cantidad de equipos para eliminatoria debe ser 8, 16 o 32.");
  }

  const totalPartidos = cantidad_equipos - 1;
  const partidosGenerados = [];
  const fechaActual = new Date();
  let partidosPorRonda = cantidad_equipos / 2;
  let rondaOffset = 0;

  while (partidosPorRonda >= 1) {
    const rondaActual = Math.log2(partidosPorRonda * 2);
    let rondaLabel = '';
    let fechaRonda = new Date(fechaActual);

    if (cantidad_equipos === 32) {
        if (rondaActual === 5) { rondaLabel = '16vos'; fechaRonda.setDate(fechaActual.getDate() + 1); }
        if (rondaActual === 4) { rondaLabel = 'Octavos'; fechaRonda.setDate(fechaActual.getDate() + 8); }
        if (rondaActual === 3) { rondaLabel = 'Cuartos'; fechaRonda.setDate(fechaActual.getDate() + 15); }
        if (rondaActual === 2) { rondaLabel = 'Semifinal'; fechaRonda.setDate(fechaActual.getDate() + 22); }
        if (rondaActual === 1) { rondaLabel = 'Final'; fechaRonda.setDate(fechaActual.getDate() + 29); }
    } else if (cantidad_equipos === 16) {
        if (rondaActual === 4) { rondaLabel = 'Octavos'; fechaRonda.setDate(fechaActual.getDate() + 1); }
        if (rondaActual === 3) { rondaLabel = 'Cuartos'; fechaRonda.setDate(fechaActual.getDate() + 8); }
        if (rondaActual === 2) { rondaLabel = 'Semifinal'; fechaRonda.setDate(fechaActual.getDate() + 15); }
        if (rondaActual === 1) { rondaLabel = 'Final'; fechaRonda.setDate(fechaActual.getDate() + 22); }
    } else {
        if (rondaActual === 3) { rondaLabel = 'Cuartos'; fechaRonda.setDate(fechaActual.getDate() + 1); }
        if (rondaActual === 2) { rondaLabel = 'Semifinal'; fechaRonda.setDate(fechaActual.getDate() + 8); }
        if (rondaActual === 1) { rondaLabel = 'Final'; fechaRonda.setDate(fechaActual.getDate() + 15); }
    }

    for (let i = 0; i < partidosPorRonda; i++) {
        const partidoIndexGlobal = rondaOffset + i;
        let fecha_partido = new Date(fechaRonda.getTime() + (i * 6 * 60 * 60 * 1000));
        let equipo_local = `Equipo Placeholder L${partidoIndexGlobal + 1}`;
        let equipo_visitante = `Equipo Placeholder V${partidoIndexGlobal + 1}`;

        if (partidosPorRonda === cantidad_equipos / 2) {
             equipo_local = `Equipo ${String.fromCharCode(65 + i*2)}`;
             equipo_visitante = `Equipo ${String.fromCharCode(65 + i*2 + 1)}`;
        } else {
             equipo_local = `Ganador ${rondaLabel === 'Cuartos' ? 'O' : (rondaLabel === 'Semifinal' ? 'CF' : 'SF')}${i*2 + 1}`;
             equipo_visitante = `Ganador ${rondaLabel === 'Cuartos' ? 'O' : (rondaLabel === 'Semifinal' ? 'CF' : 'SF')}${i*2 + 2}`;
        }

        try {
            const partido = await partidoModel.crearPartido(
                id_torneo, fecha_partido, equipo_local, equipo_visitante
            );
            partidosGenerados.push(partido);
        } catch (dbError) {
            console.error(`Error creando partido ${partidoIndexGlobal} (${rondaLabel}):`, dbError.message);
            throw new Error(`Fallo al crear el partido ${partidoIndexGlobal} del fixture.`);
        }
    }

    rondaOffset += partidosPorRonda;
    partidosPorRonda /= 2;
  }

  return partidosGenerados;
}

// --- LIGA: Generación de fixture Round-Robin (todos contra todos) ---
async function generarPartidosLiga(id_torneo, cantidadEquipos, fecha_inicio, fecha_fin) {
  if (!id_torneo || !cantidadEquipos) {
    throw new Error('ID de torneo y cantidad de equipos son requeridos');
  }

  if (cantidadEquipos < 4 || cantidadEquipos > 30) {
    throw new Error('La cantidad de equipos debe ser entre 4 y 30');
  }

  const partidosGenerados = [];
  
  // Crear array de equipos (1, 2, 3, ..., N)
  const equipos = Array.from({ length: cantidadEquipos }, (_, i) => i + 1);
  const esImpar = cantidadEquipos % 2 !== 0;
  
  // Si es impar, agregamos un "bye" para balancear
  if (esImpar) {
    equipos.push(null); // null = descanso
  }

  const totalEquipos = equipos.length;
  const totalFechas = totalEquipos - 1;
  const partidosPorFecha = totalEquipos / 2;

  // Calcular distribución temporal de las fechas
  const fechaInicioObj = new Date(fecha_inicio);
  const fechaFinObj = new Date(fecha_fin);
  const diasDisponibles = Math.floor((fechaFinObj - fechaInicioObj) / (1000 * 60 * 60 * 24));
  const diasEntreFechas = Math.max(1, Math.floor(diasDisponibles / totalFechas));

  // Algoritmo Round-Robin
  for (let fecha = 0; fecha < totalFechas; fecha++) {
    // Calcular fecha aproximada de esta jornada
    const fechaJornada = new Date(fechaInicioObj);
    fechaJornada.setDate(fechaJornada.getDate() + fecha * diasEntreFechas);

    for (let partido = 0; partido < partidosPorFecha; partido++) {
      const idLocal = equipos[partido];
      const idVisitante = equipos[totalEquipos - 1 - partido];

      // Solo crear partido si ninguno está en "bye"
      if (idLocal !== null && idVisitante !== null) {
        // Calcular hora del partido (espaciados cada 2 horas en el mismo día)
        const fechaPartido = new Date(fechaJornada.getTime() + (partido * 2 * 60 * 60 * 1000));
        
        // Nombres temporales de equipos
        const equipo_local = `Equipo ${String.fromCharCode(64 + idLocal)}`; // A, B, C...
        const equipo_visitante = `Equipo ${String.fromCharCode(64 + idVisitante)}`;

        try {
          const partidoCreado = await partidoModel.crearPartido(
            id_torneo,
            fechaPartido,
            equipo_local,
            equipo_visitante
          );
          partidosGenerados.push(partidoCreado);
        } catch (dbError) {
          console.error(`Error creando partido de liga Fecha ${fecha + 1}:`, dbError.message);
          throw new Error(`Fallo al crear partido de la Fecha ${fecha + 1}.`);
        }
      }
    }

    // Rotación Round-Robin: el primero se queda fijo, los demás rotan
    const primero = equipos[0];
    const ultimo = equipos.pop();
    equipos.splice(1, 0, ultimo);
    equipos[0] = primero;
  }

  console.log(`✓ Liga generada: ${partidosGenerados.length} partidos en ${totalFechas} fechas`);
  return partidosGenerados;
}

// --- Resto de funciones ---
async function getPartidosPorTorneoService(id_torneo) {
  return await partidoModel.getPartidosPorTorneo(id_torneo);
}

async function updatePartidoService(id_partido, data) {
  const {
    fecha_partido, 
    equipo_local, 
    equipo_visitante,
    id_equipo_local,
    id_equipo_visitante,
    resultado_local, 
    resultado_visitante,
    goleadores = [],
    amarillas = [],
    rojas = []
  } = data;

  await partidoModel.updatePartido(
    id_partido, 
    fecha_partido, 
    equipo_local, 
    equipo_visitante,
    id_equipo_local,
    id_equipo_visitante,
    resultado_local, 
    resultado_visitante
  );

  for (const id_jugador of goleadores) {
    await partidoModel.upsertEstadisticaJugadorPartido(id_partido, id_jugador, 1, 0, 0);
  }

  for (const id_jugador of amarillas) {
    await partidoModel.upsertEstadisticaJugadorPartido(id_partido, id_jugador, 0, 1, 0);
  }

  for (const id_jugador of rojas) {
    await partidoModel.upsertEstadisticaJugadorPartido(id_partido, id_jugador, 0, 0, 1);
  }

  return { message: 'Partido y estadísticas actualizadas' };
}

async function deletePartidoService(id_partido) {
  return await partidoModel.deletePartido(id_partido);
}

module.exports = {
  generarPartidosParaTorneo,
  generarPartidosLiga,
  getPartidosPorTorneoService,
  updatePartidoService,
  deletePartidoService
};