const pool = require('./db');

// Crear equipo
async function crearEquipo(nombre_equipo, id_capitan) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Crear el equipo
    const equipoResult = await client.query(
      'INSERT INTO equipos(nombre_equipo, id_capitan) VALUES($1, $2) RETURNING *',
      [nombre_equipo, id_capitan]
    );
    
    const equipo = equipoResult.rows[0];

    // Si hay capitán, agregarlo automáticamente como jugador
    if (id_capitan) {
      await client.query(
        'INSERT INTO jugadores_equipo(id_equipo, id_jugador) VALUES($1, $2)',
        [equipo.id_equipo, id_capitan]
      );
    }

    await client.query('COMMIT');
    return equipo;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Buscar equipo por capitán
async function findEquipoByCapitan(id_capitan) {
  const result = await pool.query(
    'SELECT * FROM equipos WHERE id_capitan = $1',
    [id_capitan]
  );
  return result.rows[0] || null;
}

// Traer todos los equipos
async function findAllEquipos() {
  const result = await pool.query('SELECT * FROM equipos');
  return result.rows;
}

async function agregarJugadoresAEquipo(id_equipo, jugadoresIds) {
  const queries = jugadoresIds.map(
    (id_jugador) =>
      pool.query(
        'INSERT INTO jugadores_equipo(id_equipo, id_jugador) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id_equipo, id_jugador]
      )
  );

  await Promise.all(queries);

  return { id_equipo, jugadores_agregados: jugadoresIds };
}

async function getJugadoresEquipo(idEquipo) {
  const result = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.email
     FROM jugadores_equipo je
     JOIN usuarios u ON je.id_jugador = u.id_usuario
     WHERE je.id_equipo = $1`,
    [idEquipo]
  );
  return result.rows;
};

async function eliminarJugador(idEquipo, idJugador) {
  const result = await pool.query(
    `DELETE FROM jugadores_equipo
     WHERE id_equipo = $1 AND id_jugador = $2
     RETURNING *`,
    [idEquipo, idJugador]
  );
  return result.rows[0];
};

async function getUsuarioPorId(id) {
  const result = await pool.query(
    `SELECT u.id_usuario
     FROM jugadores_equipo je
     JOIN usuarios u ON je.id_jugador = u.id_usuario
     WHERE u.id_usuario = $1`,
    [id] // usamos el parámetro que recibimos
  );
  return result.rows[0]; // devuelve un solo usuario
}

async function findEquiposByTorneo(id_torneo) {
  const result = await pool.query(
    `SELECT e.id_equipo, e.nombre_equipo, e.id_capitan
       FROM equipos e
       JOIN equipos_torneo et ON e.id_equipo = et.id_equipo
       WHERE et.id_torneo = $1`,
    [id_torneo]
  );
  return result.rows;
}

// Crear equipos por defecto para un torneo
async function crearEquiposPorDefecto(id_torneo, cantidad_equipos) {
  const equipos = [];

  for (let i = 1; i <= cantidad_equipos; i++) {
    const nombreEquipo = `Equipo${String.fromCharCode(64 + i)}`; // EquipoA, EquipoB, etc.

    // Crear el equipo
    const equipoResult = await pool.query(
      'INSERT INTO equipos(nombre_equipo, id_capitan) VALUES($1, $2) RETURNING *',
      [nombreEquipo, null] // Sin capitán por defecto
    );

    const equipo = equipoResult.rows[0];

    // Inscribir el equipo en el torneo
    await pool.query(
      'INSERT INTO equipos_torneo(id_equipo, id_torneo) VALUES($1, $2)',
      [equipo.id_equipo, id_torneo]
    );

    equipos.push(equipo);
  }

  return equipos;
}

// Actualizar nombre de equipo
async function actualizarNombreEquipo(id_equipo, nuevo_nombre) {
  const result = await pool.query(
    'UPDATE equipos SET nombre_equipo = $1 WHERE id_equipo = $2 RETURNING *',
    [nuevo_nombre, id_equipo]
  );
  return result.rows[0];
}

// Crear solicitud de inscripción
async function crearSolicitudInscripcion(id_equipo, id_jugador) {
  // Verificar si ya existe una solicitud pendiente
  const solicitudExistente = await pool.query(
    `SELECT * FROM solicitudes_equipo 
     WHERE id_equipo = $1 AND id_jugador = $2 AND estado = 'pendiente'`,
    [id_equipo, id_jugador]
  );

  if (solicitudExistente.rows.length > 0) {
    throw new Error('Ya tienes una solicitud pendiente para este equipo');
  }

  // Verificar si ya está en el equipo
  const yaEnEquipo = await pool.query(
    `SELECT * FROM jugadores_equipo WHERE id_equipo = $1 AND id_jugador = $2`,
    [id_equipo, id_jugador]
  );

  if (yaEnEquipo.rows.length > 0) {
    throw new Error('Ya eres miembro de este equipo');
  }

  const result = await pool.query(
    `INSERT INTO solicitudes_equipo(id_equipo, id_jugador, estado) 
     VALUES($1, $2, 'pendiente') RETURNING *`,
    [id_equipo, id_jugador]
  );

  return result.rows[0];
}

// Obtener solicitudes pendientes de un equipo
async function getSolicitudesPendientes(id_equipo) {
  const result = await pool.query(
    `SELECT s.*, u.nombre, u.email, u.rol
     FROM solicitudes_equipo s
     JOIN usuarios u ON s.id_jugador = u.id_usuario
     WHERE s.id_equipo = $1 AND s.estado = 'pendiente'
     ORDER BY s.fecha_solicitud DESC`,
    [id_equipo]
  );
  return result.rows;
}

// Responder solicitud (aceptar/rechazar) y luego eliminarla
async function responderSolicitud(id_solicitud, estado, id_capitan) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Obtener la solicitud
    const solicitudResult = await client.query(
      `SELECT s.*, e.id_capitan 
       FROM solicitudes_equipo s
       JOIN equipos e ON s.id_equipo = e.id_equipo
       WHERE s.id_solicitud = $1 AND s.estado = 'pendiente'`,
      [id_solicitud]
    );

    if (solicitudResult.rows.length === 0) {
      throw new Error('Solicitud no encontrada o ya fue procesada');
    }

    const solicitud = solicitudResult.rows[0];

    // Verificar que quien responde sea el capitán
    if (solicitud.id_capitan !== id_capitan) {
      throw new Error('Solo el capitán puede responder solicitudes');
    }

    // Si se acepta, agregar al equipo
    if (estado === 'aceptada') {
      await client.query(
        `INSERT INTO jugadores_equipo(id_equipo, id_jugador) 
         VALUES($1, $2) ON CONFLICT DO NOTHING`,
        [solicitud.id_equipo, solicitud.id_jugador]
      );
    }

    // Eliminar la solicitud (ya sea aceptada o rechazada)
    await client.query(
      `DELETE FROM solicitudes_equipo WHERE id_solicitud = $1`,
      [id_solicitud]
    );

    await client.query('COMMIT');

    return {
      mensaje: `Solicitud ${estado}`,
      accion: estado,
      jugador: solicitud.id_jugador
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Obtener equipo por ID (para el enlace público)
async function findEquipoById(id_equipo) {
  const result = await pool.query(
    `SELECT e.*, u.nombre as nombre_capitan 
     FROM equipos e
     LEFT JOIN usuarios u ON e.id_capitan = u.id_usuario
     WHERE e.id_equipo = $1`,
    [id_equipo]
  );
  return result.rows[0] || null;
}

module.exports = {
  crearEquipo,
  findEquipoByCapitan,
  findAllEquipos,
  agregarJugadoresAEquipo,
  getJugadoresEquipo,
  eliminarJugador,
  getUsuarioPorId,
  findEquiposByTorneo,
  crearEquiposPorDefecto,
  actualizarNombreEquipo,
  crearSolicitudInscripcion,
  getSolicitudesPendientes,
  responderSolicitud,
  findEquipoById
};