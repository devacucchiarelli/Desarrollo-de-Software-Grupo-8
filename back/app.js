const express = require('express');
const equiposRouter = require('./src/routes/equipoRoute.js');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' })); // puerto del frontend

app.use('/equipos', equiposRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
