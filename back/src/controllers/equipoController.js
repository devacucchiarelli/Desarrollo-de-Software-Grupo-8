const {
  crearEquipoService,
  getEquipoPorCapitanService,
  getTodosLosEquiposService,
  agregarJugadoresService,
  getJugadoresEquipoService,
  eliminarJugadorService,
  getUsuarioPorIdService
} = require('../services/equipoService.js');



async function crearEquipoController(req, res) {
  const { nombre_equipo, id_capitan } = req.body;
  try {
    const equipo = await crearEquipoService(nombre_equipo, id_capitan);
    res.json(equipo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
async function getJugadoresEquipoController(req, res) {
  const { idEquipo } = req.params;
  try {
    const jugadores = await getJugadoresEquipoService(idEquipo);
    res.json(jugadores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function eliminarJugadorController(req, res) {
  const { idEquipo, idJugador } = req.params;
  try {
    await eliminarJugadorService(idEquipo, idJugador);
    res.json({ mensaje: "Jugador eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

async function getEquipoPorCapitanController(req, res) {
  const { idCapitan } = req.params;
  try {
    const equipo = await getEquipoPorCapitanService(idCapitan);
    res.json(equipo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function getTodosLosEquiposController(req, res) {
  try {
    const equipos = await getTodosLosEquiposService();
    res.json(equipos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function agregarJugadoresController(req, res) {
  const { id_equipo, jugadoresIds } = req.body;

  try {
    // Primero agregamos los jugadores
    await agregarJugadoresService(id_equipo, jugadoresIds);

    // Traemos los datos completos de los jugadores agregados
    const jugadoresAgregados = await Promise.all(
      jugadoresIds.map(async (id) => {
        const jugador = await getUsuarioPorIdService(id); // función que devuelve {nombre, email, dni}
        return jugador; 
      })
    );

    res.json({ jugadores_agregados: jugadoresAgregados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  crearEquipoController,
  getEquipoPorCapitanController,
  getTodosLosEquiposController,
  agregarJugadoresController,
  getJugadoresEquipoController,
  eliminarJugadorController
};
