
// back/services/inscripciones.services.js
const  pool  = require('../models/db');



exports.inscribirEquipo = async ({ torneoId, equipoId }) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO equipos_torneo (id_torneo, id_equipo)
       VALUES ($1, $2)
       RETURNING *`,
      [torneoId, equipoId]
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
       JOIN usuarios u ON u.id_usuario = e.id_capitan
     ORDER BY et.id_torneo DESC, e.id_equipo DESC`
  );
  return rows;
};
