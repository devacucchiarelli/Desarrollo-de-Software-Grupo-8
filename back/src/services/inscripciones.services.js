// back/services/inscripciones.services.js
const pool = require('../models/db');

exports.inscribirEquipo = async ({ torneoId, equipoId }) => {
  try {
    // Verificar si ya está inscrito
    const verificacion = await pool.query(
      'SELECT * FROM equipos_torneo WHERE id_torneo = $1 AND id_equipo = $2',
      [torneoId, equipoId]
    );

    if (verificacion.rows.length > 0) {
      throw new Error('El equipo ya está inscrito en este torneo');
    }

    // Insertar inscripción
    const { rows } = await pool.query(
      `INSERT INTO equipos_torneo (id_torneo, id_equipo)
       VALUES ($1, $2)
       RETURNING *`,
      [torneoId, equipoId]
    );

    // Actualizar cantidad de equipos en el torneo
    await pool.query(
      'UPDATE torneos SET cantidad_equipos = cantidad_equipos + 1 WHERE id_torneo = $1',
      [torneoId]
    );

    return {
      ok: true,
      inscripcion: rows[0],
    };
  } catch (err) {
    console.error('Error inscribiendo equipo:', err);
    throw err;
  }
};

exports.listar = async () => {
  try {
    const { rows } = await pool.query(
      `SELECT et.id_torneo,
              t.nombre_torneo,
              e.id_equipo,
              e.nombre_equipo,
              u.id_usuario as id_capitan,
              u.nombre as nombre_capitan,
              u.email as email_capitan
       FROM equipos_torneo et
         JOIN torneos t ON t.id_torneo = et.id_torneo
         JOIN equipos e ON e.id_equipo = et.id_equipo
         LEFT JOIN usuarios u ON u.id_usuario = e.id_capitan
       ORDER BY et.id_torneo DESC, e.id_equipo DESC`
    );
    
    console.log('📊 Inscripciones encontradas:', rows.length);
    console.log('Datos:', rows);
    
    return rows;
  } catch (err) {
    console.error('Error listando inscripciones en service:', err);
    throw err;
  }
};

exports.listarPorTorneo = async (torneoId) => {
  try {
    const { rows } = await pool.query(
      `SELECT et.id_torneo,
              t.nombre_torneo,
              e.id_equipo,
              e.nombre_equipo,
              u.id_usuario as id_capitan,
              u.nombre as nombre_capitan,
              u.email as email_capitan
       FROM equipos_torneo et
         JOIN torneos t ON t.id_torneo = et.id_torneo
         JOIN equipos e ON e.id_equipo = et.id_equipo
         LEFT JOIN usuarios u ON u.id_usuario = e.id_capitan
       WHERE et.id_torneo = $1
       ORDER BY e.nombre_equipo ASC`,
      [torneoId]
    );
    
    return rows;
  } catch (err) {
    console.error('Error listando equipos del torneo:', err);
    throw err;
  }
};