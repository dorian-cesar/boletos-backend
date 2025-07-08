// scripts/importLayouts.js
const mongoose = require('mongoose');
const Layout = require('../models/Layout');
const layoutsData = require('../layout.json').layouts;
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Conectado a MongoDB');

    for (const [name, layout] of Object.entries(layoutsData)) {
      const existing = await Layout.findOne({ name });
      if (existing) {
        console.log(`⚠️ Layout ${name} ya existe, saltando.`);
        continue;
      }

      await Layout.create({
        name,
        ...layout
      });

      console.log(`✅ Layout ${name} importado.`);
    }

    console.log('🏁 Importación finalizada');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error importando layouts:', err);
    process.exit(1);
  }
})();
