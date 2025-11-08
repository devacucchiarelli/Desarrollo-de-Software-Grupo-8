const partidoModel = require('../models/partidoModel');
const equipoModel = require('../models/equipoModel');
const torneoModel = require('../models/torneoModel');
const { query } = require('../../db');


async function calcularTablaPosiciones(id_torneo) {
    // 1. Obtener partidos y equipos
    const partidos = await partidoModel.getPartidosPorTorneo(id_torneo);
    let equiposInscritos = await equipoModel.findEquiposByTorneo(id_torneo);
    
    // Si no hay equipos inscritos, crear equipos por defecto
    if (equiposInscritos.length === 0) {
        const torneo = await torneoModel.findTorneoById(id_torneo);
        if (torneo && torneo.formato === 'liga' && torneo.cantidad_equipos) {
            equiposInscritos = await equipoModel.crearEquiposPorDefecto(id_torneo, torneo.cantidad_equipos);
        }
    }

    // 2. Inicializar estadísticas
    const estadisticas = {};
    equiposInscritos.forEach(equipo => {
        estadisticas[equipo.id_equipo] = {
            id_equipo: equipo.id_equipo, nombre_equipo: equipo.nombre_equipo,
            PJ: 0, PG: 0, PE: 0, PP: 0, GF: 0, GC: 0, DG: 0, PTS: 0,
        };
    });

  

    //  Procesar cada partido para actualizar estadísticas
    partidos.forEach(partido => {
        const resLocal = partido.resultado_local;
        const resVisitante = partido.resultado_visitante;

        if (resLocal !== null && resVisitante !== null) {
            // --- BÚSQUEDA FLEXIBLE POR NOMBRE ---
            const nombreLocalNormalizado = partido.equipo_local?.trim().toLowerCase();
            const nombreVisitanteNormalizado = partido.equipo_visitante?.trim().toLowerCase();

            const equipoLocal = equiposInscritos.find(e => e.nombre_equipo?.trim().toLowerCase() === nombreLocalNormalizado);
            const equipoVisitante = equiposInscritos.find(e => e.nombre_equipo?.trim().toLowerCase() === nombreVisitanteNormalizado);
            // --- FIN BÚSQUEDA FLEXIBLE ---

            // El resto de la lógica para actualizar statsLocal y statsVisitante sigue igual...
            if (equipoLocal && estadisticas[equipoLocal.id_equipo]) {
                const statsLocal = estadisticas[equipoLocal.id_equipo];
                statsLocal.PJ += 1; /* ... */
                statsLocal.GF += resLocal; statsLocal.GC += resVisitante;
                if (resLocal > resVisitante) { statsLocal.PG += 1; statsLocal.PTS += 3; }
                else if (resLocal === resVisitante) { statsLocal.PE += 1; statsLocal.PTS += 1; }
                else { statsLocal.PP += 1; }
            }
            if (equipoVisitante && estadisticas[equipoVisitante.id_equipo]) {
                const statsVisitante = estadisticas[equipoVisitante.id_equipo];
                statsVisitante.PJ += 1; /* ... */
                statsVisitante.GF += resVisitante; statsVisitante.GC += resLocal;
                if (resVisitante > resLocal) { statsVisitante.PG += 1; statsVisitante.PTS += 3; }
                else if (resVisitante === resLocal) { statsVisitante.PE += 1; statsVisitante.PTS += 1; }
                else { statsVisitante.PP += 1; }
            }
        }
    });

    // 5. Calcular DG, convertir a array y ordenar
    const tablaArray = Object.values(estadisticas).map(stats => {
        stats.DG = stats.GF - stats.GC;
        return stats;
    });
    tablaArray.sort((a, b) => {
        if (b.PTS !== a.PTS) return b.PTS - a.PTS;
        if (b.DG !== a.DG) return b.DG - a.DG;
        if (b.GF !== a.GF) return b.GF - a.GF;
        return a.nombre_equipo.localeCompare(b.nombre_equipo);
    });

    return tablaArray;
}

// Recalcula y persiste la tabla_posiciones en base a los resultados del torneo
async function recalcularTablaPorTorneo(id_torneo) {
  const tabla = await calcularTablaPosiciones(id_torneo);

  // Limpiar tabla anterior de ese torneo
  await query('DELETE FROM tabla_posiciones WHERE id_torneo = $1', [id_torneo]);

  // Insertar nueva tabla calculada
  for (const row of tabla) {
    await query(
      `
      INSERT INTO tabla_posiciones (
        id_torneo, nombre_equipo,
        pj, pg, pe, pp, gf, gc, dg, puntos
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
      `,
      [
        id_torneo,
        row.nombre_equipo,
        row.PJ,
        row.PG,
        row.PE,
        row.PP,
        row.GF,
        row.GC,
        row.DG,
        row.PTS,
      ]
    );
  }
}

// Devuelve la tabla de posiciones ya guardada en la BD
async function obtenerTablaPorTorneo(id_torneo) {
  const { rows } = await query(
    `
    SELECT nombre_equipo, pj, pg, pe, pp, gf, gc, dg, puntos
    FROM tabla_posiciones
    WHERE id_torneo = $1
    ORDER BY puntos DESC, dg DESC, gf DESC, nombre_equipo ASC;
    `,
    [id_torneo]
  );

  return rows;
}


async function actualizarNombreEquipo(id_equipo, nuevo_nombre) {
    try {
        const equipoActualizado = await equipoModel.actualizarNombreEquipo(id_equipo, nuevo_nombre);
        return equipoActualizado;
    } catch (error) {
        console.error("Error al actualizar nombre del equipo:", error);
        throw error;
    }
}

module.exports = {
  recalcularTablaPorTorneo,
  obtenerTablaPorTorneo,
  actualizarNombreEquipo,
  calcularTablaPosiciones, 
};
