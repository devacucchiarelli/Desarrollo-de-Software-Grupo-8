// back/controllers/inscripciones.controller.js
const inscripcionesService = require('../services/inscripciones.services');

exports.crear = async (req, res) => {
  try {

    
    const { id_torneo, id_equipo } = req.body;

  
    if (!id_torneo || !id_equipo) {
      console.error('❌ Validación fallida - faltan parámetros');
      return res.status(400).json({ 
        error: 'Se requieren id_torneo e id_equipo',
        recibido: { id_torneo, id_equipo }
      });
    }


    const resultado = await inscripcionesService.inscribirEquipo({
      torneoId: id_torneo,
      equipoId: id_equipo
    });


  } catch (error) {
    console.error('❌ Error al crear inscripción:', error.message);
    console.error('Stack:', error.stack);

    if (error.message === 'El equipo ya está inscrito en este torneo') {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ 
      error: 'Error al inscribir el equipo',
      details: error.message 
    });
  }
};

exports.listar = async (req, res) => {
  try {
    const inscripciones = await inscripcionesService.listar();
    
    res.json(inscripciones);
  } catch (error) {
    console.error('❌ Error listando inscripciones:', error);
    res.status(500).json({ error: 'Error al listar inscripciones' });
  }
};

exports.listarPorTorneo = async (req, res) => {
  try {
    const { id_torneo } = req.params;
    const equipos = await inscripcionesService.listarPorTorneo(id_torneo);
    res.json(equipos);
  } catch (error) {
    console.error('Error listando equipos del torneo:', error);
    res.status(500).json({ error: 'Error al listar equipos' });
  }
};