const pool = require('./db');

// Crear torneo
async function crearTorneo(nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato) {
  const result = await pool.query(
    `INSERT INTO torneos(nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato) 
     VALUES($1, $2, $3, $4, $5) 
     RETURNING *`,
    [nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato]
  );
  return result.rows[0];
}

// Traer todos los torneos
async function findAllTorneos() {
  const result = await pool.query(
    `SELECT 
      id_torneo,
      nombre_torneo,
      fecha_inicio,
      fecha_fin,
      tipo_torneo,
      formato,
      TO_CHAR(fecha_inicio, 'DD/MM/YYYY') as fecha_inicio_formato,
      TO_CHAR(fecha_fin, 'DD/MM/YYYY') as fecha_fin_formato
     FROM torneos 
     ORDER BY fecha_inicio DESC`
  );
  return result.rows;
}


// Eliminar torneo
async function deleteTorneo(id_torneo) {
  const result = await pool.query(
    `DELETE FROM torneos WHERE id_torneo = $1 RETURNING *`,
    [id_torneo]
  );
  return result.rows[0];
}

async function editarTorneo(id_torneo, nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato) {
  const result = await pool.query(
    `UPDATE torneos 
     SET nombre_torneo = $1, 
         fecha_inicio = $2, 
         fecha_fin = $3, 
         tipo_torneo = $4, 
         formato = $5
     WHERE id_torneo = $6
     RETURNING *`,
    [nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato, id_torneo]
  );
  return result.rows[0];
}

module.exports = {
  crearTorneo,
  findAllTorneos,
  deleteTorneo,
  editarTorneo
};