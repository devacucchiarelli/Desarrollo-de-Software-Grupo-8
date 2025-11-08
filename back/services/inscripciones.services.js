
// back/services/inscripciones.services.js
const { pool } = require('../db');

// helpers
async function findOrCreateCapitan(client, { nombre, email }) {
  // ¿existe usuario por email?
  const { rows: u1 } = await client.query(
    `SELECT id_usuario FROM usuarios WHERE email = $1`,
    [email]
  );

  if (u1.length > 0) {
    // si existe, forzamos su rol a 'capitan' si no lo es
    await client.query(
      `UPDATE usuarios SET rol_rol_usuario = 'capitan' WHERE id_usuario = $1`,
      [u1[0].id_usuario]
    );
    return u1[0].id_usuario;
  }

  // crea un usuario capitan (password_hash puede ser vacío si no hay login todavía)
  const { rows: u2 } = await client.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol_rol_usuario)
     VALUES ($1, $2, '', 'capitan')
     RETURNING id_usuario`,
    [nombre, email]
  );
  return u2[0].id_usuario;
}

async function crearEquipo(client, { nombreEquipo, idCapitan }) {
  const { rows } = await client.query(
    `INSERT INTO equipos (nombre_equipo, id_capitan)
     VALUES ($1, $2)
     RETURNING id_equipo`,
    [nombreEquipo, idCapitan]
  );
  return rows[0].id_equipo;
}

async function vincularEquipoATorneo(client, { idTorneo, idEquipo }) {
  await client.query(
    `INSERT INTO equipos_torneo (id_torneo, id_equipo)
     VALUES ($1, $2)`,
    [idTorneo, idEquipo]
  );
}

exports.crear = async ({ torneoId, nombreEquipo, nombreCapitan, emailCapitan }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const idCapitan = await findOrCreateCapitan(client, {
      nombre: nombreCapitan,
      email: emailCapitan,
    });

    const idEquipo = await crearEquipo(client, {
      nombreEquipo,
      idCapitan,
    });

    await vincularEquipoATorneo(client, { idTorneo: torneoId, idEquipo });

    await client.query('COMMIT');

    return {
      ok: true,
      equipo: { id_equipo: idEquipo, nombre_equipo: nombreEquipo },
      capitan: { id_usuario: idCapitan, email: emailCapitan },
      torneo: { id_torneo: torneoId },
    };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
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
