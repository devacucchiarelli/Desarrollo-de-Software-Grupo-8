const {
    crearTorneoService,
    getTodosLosTorneosService,
    eliminarTorneoService,
    editarTorneoService
} = require('../services/torneoService.js');


async function crearTorneoController(req, res) {
    try {
        const torneo = await crearTorneoService(req.body);
        res.status(201).json(torneo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getTodosLosTorneosController(req, res) {
    try {
        const torneos = await getTodosLosTorneosService();
        res.status(200).json(torneos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function eliminarTorneoController(req, res) {
    try {
        const { id } = req.params;
        const torneoEliminado = await eliminarTorneoService(id);
        res.status(200).json({
            message: 'Torneo eliminado exitosamente',
            torneo: torneoEliminado
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
async function editarTorneoController(req, res) {
    try {
        const { id } = req.params;
        const { nombre_torneo, fecha_inicio, fecha_fin, tipo_torneo, formato } = req.body;

        const torneoActualizado = await editarTorneoService(
            id,
            nombre_torneo,
            fecha_inicio,
            fecha_fin,
            tipo_torneo,
            formato
        );

        res.status(200).json(torneoActualizado);
    } catch (error) {
        console.error('Error en editarTorneoController:', error);
        res.status(400).json({ error: error.message });
    }
}
module.exports = {
    crearTorneoController,
    getTodosLosTorneosController,
    eliminarTorneoController,
    editarTorneoController
};