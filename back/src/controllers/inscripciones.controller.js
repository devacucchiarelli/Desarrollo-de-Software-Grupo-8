// back/controllers/inscripciones.controller.js
const service = require('../services/inscripciones.services');

exports.listar = async (req, res) => {
  try {
    const data = await service.listar();
    res.json(data);
  } catch (err) {
    console.error('listar inscripciones:', err);
    res.status(500).json({ error: 'Error listando inscripciones' });
  }
};

exports.crear = async (req, res) => {
  try {
    const { torneoId, equipoId } = req.body;

    if (!torneoId || !equipoId) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const result = await service.inscribirEquipo({
      torneoId: Number(torneoId),
      equipoId: Number(equipoId),
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('crear inscripción:', err);
    res.status(500).json({ error: 'Error creando la inscripción' });
  }
};

