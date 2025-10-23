const tablaPosicionesService = require('../services/tablaPosicionesService');
const torneoModel = require('../models/torneoModel');

async function getTablaPosicionesController(req, res) {
    try {
        const { idTorneo } = req.params;
        const idTorneoInt = parseInt(idTorneo, 10);

        const torneo = await torneoModel.findTorneoById(idTorneoInt);
        if (!torneo) { return res.status(404).json({ error: 'Torneo no encontrado' }); }
        if (torneo.formato !== 'liga') { return res.status(400).json({ error: 'Este torneo no es de formato Liga' }); }

        const tabla = await tablaPosicionesService.calcularTablaPosiciones(idTorneoInt);
        res.status(200).json(tabla);

    } catch (error) {
        console.error("Error al obtener tabla de posiciones:", error);
        res.status(500).json({ error: 'Error interno al calcular la tabla de posiciones' });
    }
}

async function actualizarNombreEquipoController(req, res) {
    try {
        const { idEquipo } = req.params;
        const { nuevo_nombre } = req.body;

        if (!nuevo_nombre || nuevo_nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre del equipo es requerido' });
        }

        const equipoActualizado = await tablaPosicionesService.actualizarNombreEquipo(idEquipo, nuevo_nombre.trim());
        
        if (!equipoActualizado) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.status(200).json({ 
            message: 'Nombre del equipo actualizado correctamente',
            equipo: equipoActualizado 
        });

    } catch (error) {
        console.error("Error al actualizar nombre del equipo:", error);
        res.status(500).json({ error: 'Error interno al actualizar el nombre del equipo' });
    }
}

module.exports = { getTablaPosicionesController, actualizarNombreEquipoController };