const equipoModel = require('../models/equipoModel.js');

async function crearEquipoService(nombre_equipo, id_capitan) {
  const equipoExistente = await equipoModel.findEquipoByCapitan(id_capitan);
  if (equipoExistente) {
    throw new Error('Ya tenés un equipo creado');
  }
  const nuevoEquipo = await equipoModel.crearEquipo(nombre_equipo, id_capitan);
  return nuevoEquipo;
}

async function getUsuarioPorIdService(id) {
  return await equipoModel.getUsuarioPorId(id)
}

async function getEquipoPorCapitanService(id_capitan) {
  return await equipoModel.findEquipoByCapitan(id_capitan);
}

async function getTodosLosEquiposService() {
  return await equipoModel.findAllEquipos();
}

async function agregarJugadoresService(id_equipo, jugadoresIds) {
  if (!Array.isArray(jugadoresIds) || jugadoresIds.length === 0) {
    throw new Error("Debe enviar al menos un jugador");
  }
  return await equipoModel.agregarJugadoresAEquipo(id_equipo, jugadoresIds);
}

async function getJugadoresEquipoService  (idEquipo)  {
  return await equipoModel.getJugadoresEquipo(idEquipo);
};

async function eliminarJugadorService  (idEquipo, idJugador)  {
  return await equipoModel.eliminarJugador(idEquipo, idJugador);
};

module.exports = {
  crearEquipoService,
  getEquipoPorCapitanService,
  getTodosLosEquiposService,
  agregarJugadoresService,
  getJugadoresEquipoService,
  eliminarJugadorService,
  getUsuarioPorIdService
};
