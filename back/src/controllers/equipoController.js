const {
  crearEquipoService,
  getEquipoPorCapitanService,
  getTodosLosEquiposService,
  agregarJugadoresService,
  getJugadoresEquipoService,
  eliminarJugadorService,
  getUsuarioPorIdService,
  getEquipoPorIdService,
  crearSolicitudInscripcionService,
  getSolicitudesPendientesService,
  responderSolicitudService
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
}

async function eliminarJugadorController(req, res) {
  const { idEquipo, idJugador } = req.params;
  try {
    await eliminarJugadorService(idEquipo, idJugador);
    res.json({ mensaje: "Jugador eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

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
    await agregarJugadoresService(id_equipo, jugadoresIds);
    const jugadoresAgregados = await Promise.all(
      jugadoresIds.map(async (id) => {
        const jugador = await getUsuarioPorIdService(id);
        return jugador;
      })
    );
    res.json({ jugadores_agregados: jugadoresAgregados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function crearSolicitudInscripcionController(req, res) {
  const { id_equipo } = req.body;

  // ✅ CORRECCIÓN: Usar req.usuario que viene del JWT
  const id_jugador = req.usuario?.id_usuario || req.usuario?.id;

  if (!id_jugador) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const solicitud = await crearSolicitudInscripcionService(id_equipo, id_jugador);
    res.json(solicitud);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function getSolicitudesPendientesController(req, res) {
  const { idEquipo } = req.params;

  try {
    const solicitudes = await getSolicitudesPendientesService(idEquipo);
    res.json(solicitudes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function responderSolicitudController(req, res) {
  const { id_solicitud } = req.params;
  const { estado } = req.body;
  const id_capitan = req.usuario?.id_usuario || req.usuario?.id;


  if (!id_capitan) {
    return res.status(401).json({ 
      error: 'No autenticado',
      debug: {
        session: !!req.session,
        sessionKeys: req.session ? Object.keys(req.session) : []
      }
    });
  }

  try {
    const resultado = await responderSolicitudService(id_solicitud, estado, id_capitan);
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function getEquipoPorIdController(req, res) {
  const { idEquipo } = req.params;

  try {
    const equipo = await getEquipoPorIdService(idEquipo);
    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json(equipo);
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
  eliminarJugadorController,
  crearSolicitudInscripcionController,
  getSolicitudesPendientesController,
  responderSolicitudController,
  getEquipoPorIdController
};