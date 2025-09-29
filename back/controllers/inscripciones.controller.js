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
    const { torneoId, nombreEquipo, nombreCapitan, emailCapitan } = req.body;

    if (!torneoId || !nombreEquipo || !nombreCapitan || !emailCapitan) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const result = await service.crear({
      torneoId: Number(torneoId),
      nombreEquipo: String(nombreEquipo).trim(),
      nombreCapitan: String(nombreCapitan).trim(),
      emailCapitan: String(emailCapitan).trim().toLowerCase(),
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('crear inscripcion:', err);
    res.status(500).json({ error: 'Error creando la inscripción' });
  }
};
