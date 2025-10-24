const partidoModel = require('../models/partidoModel');

// --- Lógica de generación de fixture (AHORA basada en cantidad_equipos) ---
async function generarPartidosParaTorneo(id_torneo, cantidad_equipos) {
  // Validamos cantidad (aunque ya debería venir validada desde torneoService)
  if (![8, 16, 32].includes(cantidad_equipos)) {
      throw new Error("La cantidad de equipos para eliminatoria debe ser 8, 16 o 32.");
  }

  // Calculamos el número total de partidos (n-1)
  const totalPartidos = cantidad_equipos - 1;
  const partidosGenerados = [];
  const fechaActual = new Date();
  let partidosPorRonda = cantidad_equipos / 2; // Partidos en la primera ronda (octavos si 16, cuartos si 8)
  let rondaOffset = 0; // Para indexar partidos correctamente

  console.log(`Generando fixture de ${totalPartidos} partidos para ${cantidad_equipos} equipos (Torneo ID: ${id_torneo}).`);

  // Bucle por rondas (Octavos -> Cuartos -> Semis -> Final)
  while (partidosPorRonda >= 1) {
    const rondaActual = Math.log2(partidosPorRonda * 2); // Identifica la ronda (4=Octavos, 3=Cuartos, 2=Semis, 1=Final)
    let rondaLabel = '';
    let fechaRonda = new Date(fechaActual); // Fecha base para esta ronda

    // Ajustar fecha base y etiqueta según la ronda
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
    } else { // 8 equipos
        if (rondaActual === 3) { rondaLabel = 'Cuartos'; fechaRonda.setDate(fechaActual.getDate() + 1); }
        if (rondaActual === 2) { rondaLabel = 'Semifinal'; fechaRonda.setDate(fechaActual.getDate() + 8); }
        if (rondaActual === 1) { rondaLabel = 'Final'; fechaRonda.setDate(fechaActual.getDate() + 15); }
    }


    console.log(` -> Generando ${partidosPorRonda} partidos de ${rondaLabel}`);

    // Bucle para los partidos de ESTA ronda
    for (let i = 0; i < partidosPorRonda; i++) {
        const partidoIndexGlobal = rondaOffset + i;
        let fecha_partido = new Date(fechaRonda.getTime() + (i * 6 * 60 * 60 * 1000)); // Partidos espaciados 6 horas
        let equipo_local = `Equipo Placeholder L${partidoIndexGlobal + 1}`;
        let equipo_visitante = `Equipo Placeholder V${partidoIndexGlobal + 1}`;

        // Nombres más específicos para la primera ronda real
        if (partidosPorRonda === cantidad_equipos / 2) {
             equipo_local = `Equipo ${String.fromCharCode(65 + i*2)}`; // A, C, E...
             equipo_visitante = `Equipo ${String.fromCharCode(65 + i*2 + 1)}`; // B, D, F...
        } else {
             // Nombres genéricos para rondas siguientes (podrían mejorarse)
             equipo_local = `Ganador ${rondaLabel === 'Cuartos' ? 'O' : (rondaLabel === 'Semifinal' ? 'CF' : 'SF')}${i*2 + 1}`;
             equipo_visitante = `Ganador ${rondaLabel === 'Cuartos' ? 'O' : (rondaLabel === 'Semifinal' ? 'CF' : 'SF')}${i*2 + 2}`;
        }


        // Creamos el partido en la DB
        try {
            const partido = await partidoModel.crearPartido(
                id_torneo, fecha_partido, equipo_local, equipo_visitante
            );
            partidosGenerados.push(partido);
        } catch (dbError) {
            console.error(`Error creando partido ${partidoIndexGlobal} (${rondaLabel}) para torneo ${id_torneo}:`, dbError.message);
            throw new Error(`Fallo al crear el partido ${partidoIndexGlobal} del fixture.`);
        }
    }

    rondaOffset += partidosPorRonda; // Actualizamos el offset para la siguiente ronda
    partidosPorRonda /= 2; // Pasamos a la siguiente ronda (mitad de partidos)
  }

  console.log(`Generados ${partidosGenerados.length} partidos en total para torneo ${id_torneo}.`);
  return partidosGenerados;
}
// --- FIN Lógica de generación ---

// --- El resto de las funciones (getPartidosPorTorneoService, etc.) sin cambios ---
async function getPartidosPorTorneoService(id_torneo) {
  return await partidoModel.getPartidosPorTorneo(id_torneo);
}
async function updatePartidoService(id_partido, data) {
  const {
    fecha_partido, equipo_local, equipo_visitante,
    resultado_local, resultado_visitante,
    goleadores_local = [], goleadores_visitante = [],
    amarillas_local = [], amarillas_visitante = [],
    rojas_local = [], rojas_visitante = []
  } = data;

  // Actualizar tabla partidos
  await partidoModel.updatePartido(
    id_partido, fecha_partido, equipo_local, equipo_visitante,
    resultado_local, resultado_visitante
  );

  // Actualizar estadísticas por jugador
  const todasEstadisticas = [
    ...goleadores_local.map(g => ({ ...g, goles: g.goles, amarillas: 0, rojas: 0 })),
    ...goleadores_visitante.map(g => ({ ...g, goles: g.goles, amarillas: 0, rojas: 0 })),
    ...amarillas_local.map(a => ({ id_jugador: a.id_jugador, goles: 0, amarillas: a.cantidad, rojas: 0 })),
    ...amarillas_visitante.map(a => ({ id_jugador: a.id_jugador, goles: 0, amarillas: a.cantidad, rojas: 0 })),
    ...rojas_local.map(r => ({ id_jugador: r.id_jugador, goles: 0, amarillas: 0, rojas: r.cantidad })),
    ...rojas_visitante.map(r => ({ id_jugador: r.id_jugador, goles: 0, amarillas: 0, rojas: r.cantidad }))
  ];

  // Insertar/actualizar en la DB
  for (const stat of todasEstadisticas) {
    await partidoModel.upsertEstadisticaJugadorPartido(
      id_partido,
      stat.id_jugador,
      stat.goles,
      stat.amarillas,
      stat.rojas
    );
  }

  return { message: 'Partido y estadísticas actualizadas' };
}

async function deletePartidoService(id_partido) {
  return await partidoModel.deletePartido(id_partido);
}
// --- Fin resto de funciones ---


module.exports = {
  generarPartidosParaTorneo,
  getPartidosPorTorneoService,
  updatePartidoService,
  deletePartidoService
};