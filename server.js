const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
require('dotenv').config();

const servicesRoutes = require('./routes/services');
const seatsRoutes = require('./routes/seats');
const layoutsRoutes = require('./routes/layouts');
const templatesRoutes = require('./routes/templates');
const uploadServicesRoutes = require('./routes/uploadServices');
const { startScheduler } = require('./utils/scheduler');



app.use(cors());
app.use(bodyParser.json());

app.use('/api/services', servicesRoutes);
app.use('/api/seats', seatsRoutes);
app.use('/api/layouts', layoutsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api', uploadServicesRoutes);



mongoose.connect('mongodb://localhost:27017/bus_transport', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ Conectado a MongoDB");
    startScheduler();
    app.listen(3000, () => console.log('🚍 Servidor corriendo en puerto 3000'));
}).catch(err => {
    console.error('❌ Error conectando a MongoDB', err);
});