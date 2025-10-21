const partidoModel = require('../models/partidoModel');

// Lógica de generación de fixture (extendida)
async function generarPartidosParaTorneo(id_torneo, formato_torneo) {
  // Total partidos para 16 equipos (8 octavos + 4 cuartos + 2 semis + 1 final) = 15
  const totalPartidos = 15;
  const partidosGenerados = [];
  const fechaActual = new Date(); // Usamos fecha actual como referencia

  // Nombres genéricos para placeholders
  const getPlaceholderName = (ronda, index) => {
      // Ejemplo: CF1, CF2, SF1, F
      if (ronda === 'CF') return `Ganador O${index*2 + 1} vs Ganador O${index*2 + 2}`;
      if (ronda === 'SF') return `Ganador CF${index*2 + 1} vs Ganador CF${index*2 + 2}`;
      if (ronda === 'F') return `Ganador SF1 vs Ganador SF2`;
      return `Equipo Placeholder`; // Default
  };

  for (let i = 0; i < totalPartidos; i++) {
    let fecha_partido;
    let equipo_local;
    let equipo_visitante;
    let rondaLabel = ''; // Para identificar la ronda (opcional, para logging)

    // --- Octavos de Final (Primeros 8 partidos) ---
    if (i < 8) {
      rondaLabel = 'Octavos';
      // Asigna fechas de ejemplo (cada 3 horas desde ahora)
      fecha_partido = new Date(fechaActual.getTime() + (i * 3 * 60 * 60 * 1000));
      equipo_local = `Equipo ${String.fromCharCode(65 + i*2)}`; // A, C, E...
      equipo_visitante = `Equipo ${String.fromCharCode(65 + i*2 + 1)}`; // B, D, F...
    }
    // --- Cuartos de Final (Partidos 8, 9, 10, 11) ---
    else if (i < 12) {
       rondaLabel = 'Cuartos';
       // Fecha placeholder (ej: 1 semana después del último octavo)
       fecha_partido = new Date(fechaActual.getTime() + (7 * 24 * 60 * 60 * 1000) + ((i-8) * 6 * 60 * 60 * 1000)); // Espaciados 6 horas
       equipo_local = `Ganador O${(i-8)*2 + 1}`; // Ganador O1, O3, O5, O7
       equipo_visitante = `Ganador O${(i-8)*2 + 2}`; // Ganador O2, O4, O6, O8
    }
    // --- Semifinales (Partidos 12, 13) ---
    else if (i < 14) {
      rondaLabel = 'Semifinal';
      // Fecha placeholder (ej: 2 semanas después)
      fecha_partido = new Date(fechaActual.getTime() + (14 * 24 * 60 * 60 * 1000) + ((i-12) * 12 * 60 * 60 * 1000)); // Espaciados 12 horas
      equipo_local = `Ganador CF${(i-12)*2 + 1}`; // Ganador CF1, CF3
      equipo_visitante = `Ganador CF${(i-12)*2 + 2}`; // Ganador CF2, CF4
    }
    // --- Final (Partido 14) ---
    else {
      rondaLabel = 'Final';
      // Fecha placeholder (ej: 3 semanas después)
      fecha_partido = new Date(fechaActual.getTime() + (21 * 24 * 60 * 60 * 1000));
      equipo_local = `Ganador SF1`;
      equipo_visitante = `Ganador SF2`;
    }

    // console.log(`Generando ${rondaLabel} ${i}: ${equipo_local} vs ${equipo_visitante}`); // Log para debug

    // Creamos el partido en la DB
    try {
        const partido = await partidoModel.crearPartido(
            id_torneo,
            fecha_partido,
            equipo_local,
            equipo_visitante
        );
        partidosGenerados.push(partido);
    } catch (dbError) {
        console.error(`Error creando partido ${i} para torneo ${id_torneo}:`, dbError.message);
        // Podrías decidir si continuar o lanzar un error general
        throw new Error(`Fallo al crear el partido ${i} del fixture.`);
    }
  }
  console.log(`Generados ${partidosGenerados.length} partidos para torneo ${id_torneo}.`);
  return partidosGenerados;
}

// --- El resto de las funciones (getPartidosPorTorneoService, etc.) sin cambios ---
async function getPartidosPorTorneoService(id_torneo) {
  return await partidoModel.getPartidosPorTorneo(id_torneo);
}
async function updatePartidoService(id_partido, data) {
  const { fecha_partido, equipo_local, equipo_visitante, resultado_local, resultado_visitante } = data;
  return await partidoModel.updatePartido(
    id_partido, fecha_partido, equipo_local, equipo_visitante,
    resultado_local, resultado_visitante
  );
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