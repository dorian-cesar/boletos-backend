const City = require("../models/City");
const RouteBlockGenerated = require("../models/RouteBlockGenerated");
const RouteMaster = require("../models/RouteMaster");

// Obtener todas las ciudades
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener las ciudades" });
  }
};

// Obtener una ciudad por ID
exports.getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ error: "Ciudad no encontrada" });
    res.json(city);
  } catch (err) {
    res.status(500).json({ error: "Error al buscar la ciudad" });
  }
};

// Obtener ciudades por ID de routeBlocksGenerated
exports.getCitiesFromGenerated = async (req, res) => {
  try {
    const { generatedId } = req.params;

    // 1. Buscar el servicio generado
    const generated = await RouteBlockGenerated.findById(generatedId);
    if (!generated) {
      return res.status(404).json({ error: "Servicio generado no encontrado" });
    }

    // 2. Agrupar destinos por origen
    const citiesMap = {};

    generated.segments.forEach((seg) => {
      if (!citiesMap[seg.from]) {
        citiesMap[seg.from] = [];
      }
      // evitar duplicados
      if (!citiesMap[seg.from].includes(seg.to)) {
        citiesMap[seg.from].push(seg.to);
      }
    });

    // 3. Transformar a arreglo de objetos
    const result = Object.keys(citiesMap).map((origen) => ({
      origen,
      destinos: citiesMap[origen],
    }));

    res.json(result);
  } catch (err) {
    console.error("Error en getCitiesFromGenerated:", err);
    res.status(500).json({ error: "Error al obtener las ciudades" });
  }
};

// Obtener ciudades de todas las RouteMaster
exports.getCitiesFromAllRouteMasters = async (req, res) => {
  try {
    // 1. Obtener todas las rutas maestras
    const routes = await RouteMaster.find();

    if (!routes || routes.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron rutas maestras" });
    }

    const allCitiesMap = {};

    // 2. Recorrer cada ruta maestra
    routes.forEach((route) => {
      const stopsOrdered = [...route.stops].sort((a, b) => a.order - b.order);

      for (let i = 0; i < stopsOrdered.length - 1; i++) {
        for (let j = i + 1; j < stopsOrdered.length; j++) {
          const from = stopsOrdered[i].name;
          const to = stopsOrdered[j].name;

          if (!allCitiesMap[from]) allCitiesMap[from] = [];
          if (!allCitiesMap[from].includes(to)) allCitiesMap[from].push(to);
        }
      }
    });

    // 3. Transformar a arreglo de objetos
    const result = Object.keys(allCitiesMap).map((origen) => ({
      origen,
      destinos: allCitiesMap[origen],
    }));

    res.json(result);
  } catch (err) {
    console.error("Error en getCitiesFromAllRouteMasters:", err);
    res
      .status(500)
      .json({
        error: "Error al obtener las ciudades desde todas las rutas maestras",
      });
  }
};

// Crear una nueva ciudad
exports.createCity = async (req, res) => {
  try {
    const { name, region, country } = req.body;

    if (!name)
      return res.status(400).json({ error: "El nombre es obligatorio" });

    const existing = await City.findOne({ name });
    if (existing) return res.status(400).json({ error: "La ciudad ya existe" });

    const city = new City({ name, region, country });
    await city.save();
    res.status(201).json(city);
  } catch (err) {
    res.status(500).json({ error: "Error al crear la ciudad" });
  }
};

// Actualizar una ciudad
exports.updateCity = async (req, res) => {
  try {
    const updated = await City.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ error: "Ciudad no encontrada" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar la ciudad" });
  }
};

// Eliminar una ciudad
exports.deleteCity = async (req, res) => {
  try {
    const deleted = await City.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Ciudad no encontrada" });
    res.json({ message: "Ciudad eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar la ciudad" });
  }
};
