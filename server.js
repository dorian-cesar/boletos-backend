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
const routesRoutes = require('./routes/routes');
const usersRoutes = require('./routes/users');
const busesRoutes = require('./routes/buses');
const asignacionRoutes = require('./routes/servicioAsignacion');
const cityRoutes = require('./routes/cities');
const companyRoutes = require('./routes/companies');
const terminalRoutes = require('./routes/terminals');





//app.use(cors());
// ✅ Configurar CORS globalmente
app.use(cors({
    origin: '*', // ⚠️ Usa esto solo para desarrollo
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

app.use('/api/services', servicesRoutes);
app.use('/api/seats', seatsRoutes);
app.use('/api/layouts', layoutsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api', uploadServicesRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/buses', busesRoutes);
app.use('/api/cajas', require('./routes/caja'));
app.use('/api/movimientos', require('./routes/movimientos'));
app.use('/api/servicios', asignacionRoutes);
app.use('/api/email', require('./routes/email'));
app.use('/api/cities', cityRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/terminals', terminalRoutes);



const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ Conectado a MongoDB");
    console.log(MONGO_URI);
    startScheduler();
    app.listen(3000, () => console.log('🚍 Servidor corriendo en puerto 3000'));
}).catch(err => {
    console.error('❌ Error conectando a MongoDB', err);
});