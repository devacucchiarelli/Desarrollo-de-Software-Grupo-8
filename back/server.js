const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para interpretar JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend de torneos funcionando 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
