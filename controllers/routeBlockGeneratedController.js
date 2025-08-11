// controllers/routeBlockGeneratedController.js
const RouteBlock = require('../models/RouteBlock');
const RouteBlockGenerated = require('../models/RouteBlockGenerated');
const Layout = require('../models/Layout');

exports.generateRouteBlock = async (req, res) => {
  try {
    const { routeBlockId, date, time, layoutId, crew } = req.body;

    // 1. Obtener el bloque de ruta
    const routeBlock = await RouteBlock.findById(routeBlockId).populate('routeMaster');
    console.log(routeBlock);
    if (!routeBlock) {
      return res.status(404).json({ message: 'RouteBlock no encontrado' });
    }

    // Validar que el routeMaster tenga paradas
    if (!routeBlock.routeMaster || !Array.isArray(routeBlock.routeMaster.stops)) {
      return res.status(400).json({ message: 'El routeMaster no tiene paradas definidas' });
    }

    // 2. Ordenar las paradas por el campo "order"
    const stopsOrdered = [...routeBlock.stops].sort((a, b) => a.order - b.order);

    // 3. Obtener el layout desde la colección Layout
    const layout = await Layout.findById(layoutId);
    if (!layout) {
      return res.status(404).json({ message: 'Layout no encontrado' });
    }

    // 4. Extraer todos los asientos de floor1 y floor2
    const seats = [];
    if (layout.floor1?.seatMap) {
      layout.floor1.seatMap.forEach(row => {
        row.forEach(seatId => {
          if (seatId) seats.push(seatId);
        });
      });
    }
    if (layout.floor2?.seatMap) {
      layout.floor2.seatMap.forEach(row => {
        row.forEach(seatId => {
          if (seatId) seats.push(seatId);
        });
      });
    }

    // 5. Generar TODAS las combinaciones posibles de tramos (no solo consecutivos)
    const allSegments = [];
    for (let i = 0; i < stopsOrdered.length - 1; i++) {
      for (let j = i + 1; j < stopsOrdered.length; j++) {
        allSegments.push({
          from: stopsOrdered[i].name,
          to: stopsOrdered[j].name
        });
      }
    }

    // 6. Crear seatMatrix con todos los tramos para cada asiento
    const seatMatrix = {};
    for (const seatId of seats) {
      seatMatrix[seatId] = allSegments.map(seg => ({
        seatNumber: seatId,
        occupied: false,
        passengerName: null,
        passengerDocument: null,
        from: seg.from,
        to: seg.to
      }));
    }

    // 7. Guardar el servicio generado
    const generatedService = new RouteBlockGenerated({
      routeBlock: routeBlockId,
      date,
      time,
      layout: layout._id,
      crew,
      seatMatrix
    });

    await generatedService.save();

    res.status(201).json({
      message: 'Servicio generado correctamente',
      data: generatedService
    });

  } catch (error) {
    console.error('Error al generar servicio de bloque:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


exports.getAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'Debe especificar los parámetros from y to' });
    }

    const service = await RouteBlockGenerated.findById(id).populate({
      path: 'routeBlock',
      select: 'stops'
    });

    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });

    const stops = [...service.routeBlock.stops].sort((a, b) => a.order - b.order);
    const fromIndex = stops.findIndex(s => s.name === from);
    const toIndex = stops.findIndex(s => s.name === to);

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
      return res.status(400).json({ message: 'Paradas inválidas o en orden incorrecto' });
    }

    // Construir segmentos que corresponden al tramo solicitado
    const segmentsToCheck = [];
    for (let i = fromIndex; i < toIndex; i++) {
      segmentsToCheck.push({ from: stops[i].name, to: stops[i + 1].name });
    }

    const availability = [];

    // Recorrer cada asiento en seatMatrix
    for (const [seatNumber, seatSegments] of service.seatMatrix.entries()) {
      // Filtrar solo los segmentos que están dentro del tramo solicitado
      const relevantSegments = seatSegments.filter(s =>
        segmentsToCheck.some(seg => seg.from === s.from && seg.to === s.to)
      );

      // Si todos los segmentos relevantes están libres, está disponible
      const isAvailable = relevantSegments.every(s => s.occupied === false);

      availability.push({
        seatNumber,
        occupied: !isAvailable,
        passengerName: isAvailable ? null : relevantSegments.find(s => s.occupied)?.passengerName || null,
        passengerDocument: isAvailable ? null : relevantSegments.find(s => s.occupied)?.passengerDocument || null,
        from,
        to
      });
    }

    res.json({ availability });

  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};




// Reservar asiento en tramo específico
exports.reserveSeat = async (req, res) => {
  try {
    const { id } = req.params; // routeBlockGeneratedId
    const { seatNumber, from, to, passengerName, passengerDocument } = req.body;

    if (!seatNumber || !from || !to) {
      return res.status(400).json({ message: 'Faltan datos obligatorios: seatNumber, from, to' });
    }

    const service = await RouteBlockGenerated.findById(id).populate({
      path: 'routeBlock',
      select: 'stops'
    });

    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });

    const stops = [...service.routeBlock.stops].sort((a,b) => a.order - b.order);
    const fromIndex = stops.findIndex(s => s.name === from);
    const toIndex = stops.findIndex(s => s.name === to);

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
      return res.status(400).json({ message: 'Paradas inválidas o en orden incorrecto' });
    }

    // Construir todos los segmentos consecutivos entre from y to
    const segmentsToReserve = [];
    for(let i = fromIndex; i < toIndex; i++) {
      segmentsToReserve.push({
        from: stops[i].name,
        to: stops[i+1].name
      });
    }

    // Obtener segmentos actuales para el asiento
    const seatSegments = service.seatMatrix.get(seatNumber);
    if (!seatSegments) {
      return res.status(404).json({ message: 'Asiento no encontrado' });
    }

    // Verificar que ninguno de los segmentos consecutivos esté ocupado
    const anyOccupied = segmentsToReserve.some(seg => {
      return seatSegments.some(s =>
        s.from === seg.from && s.to === seg.to && s.occupied === true
      );
    });

    if (anyOccupied) {
      return res.status(400).json({ message: 'Asiento ocupado en uno o más tramos internos' });
    }

    // Marcar segmentos consecutivos como ocupados
    seatSegments.forEach(s => {
      const shouldReserve = segmentsToReserve.some(seg => seg.from === s.from && seg.to === s.to);
      if (shouldReserve) {
        s.occupied = true;
        s.passengerName = passengerName || null;
        s.passengerDocument = passengerDocument || null;
      }
    });

    // También marcar el tramo largo (from-to) si existe en matriz o agregarlo
    const longSegmentIndex = seatSegments.findIndex(s => s.from === from && s.to === to);
    if (longSegmentIndex >= 0) {
      seatSegments[longSegmentIndex].occupied = true;
      seatSegments[longSegmentIndex].passengerName = passengerName || null;
      seatSegments[longSegmentIndex].passengerDocument = passengerDocument || null;
    } else {
      // Si no existe, agregarlo al arreglo para reflejar la reserva completa
      seatSegments.push({
        seatNumber,
        from,
        to,
        occupied: true,
        passengerName: passengerName || null,
        passengerDocument: passengerDocument || null,
      });
    }

    service.seatMatrix.set(seatNumber, seatSegments);
    await service.save();

    res.json({ message: 'Asiento reservado correctamente', seatNumber, from, to });

  } catch (error) {
    console.error('Error al reservar asiento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};



// Consultar matriz de asientos actualizada
exports.getSeatMatrix = async (req, res) => {
  try {
    const { id } = req.params; // routeBlockGeneratedId

    const service = await RouteBlockGenerated.findById(id);
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });

    res.json({
      routeBlockGeneratedId: id,
      seatMatrix: service.seatMatrix
    });
  } catch (error) {
    console.error('Error al obtener matriz de asientos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.releaseSeat = async (req, res) => {
  try {
    const { id } = req.params; // routeBlockGeneratedId
    const { seatNumber, from, to } = req.body;

    if (!seatNumber || !from || !to) {
      return res.status(400).json({ message: 'Faltan datos obligatorios: seatNumber, from, to' });
    }

    const service = await RouteBlockGenerated.findById(id).populate({
      path: 'routeBlock',
      select: 'stops'
    });

    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });

    const stops = [...service.routeBlock.stops].sort((a,b) => a.order - b.order);
    const fromIndex = stops.findIndex(s => s.name === from);
    const toIndex = stops.findIndex(s => s.name === to);

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
      return res.status(400).json({ message: 'Paradas inválidas o en orden incorrecto' });
    }

    // Construir segmentos consecutivos a liberar
    const segmentsToRelease = [];
    for(let i = fromIndex; i < toIndex; i++) {
      segmentsToRelease.push({
        from: stops[i].name,
        to: stops[i+1].name
      });
    }

    const seatSegments = service.seatMatrix.get(seatNumber);
    if (!seatSegments) {
      return res.status(404).json({ message: 'Asiento no encontrado' });
    }

    // Liberar segmentos consecutivos
    seatSegments.forEach(s => {
      const shouldRelease = segmentsToRelease.some(seg => seg.from === s.from && seg.to === s.to);
      if (shouldRelease) {
        s.occupied = false;
        s.passengerName = null;
        s.passengerDocument = null;
      }
    });

    // Liberar segmento largo si existe
    const longSegmentIndex = seatSegments.findIndex(s => s.from === from && s.to === to);
    if (longSegmentIndex >= 0) {
      seatSegments[longSegmentIndex].occupied = false;
      seatSegments[longSegmentIndex].passengerName = null;
      seatSegments[longSegmentIndex].passengerDocument = null;
    }

    service.seatMatrix.set(seatNumber, seatSegments);
    await service.save();

    res.json({ message: 'Asiento liberado correctamente', seatNumber, from, to });

  } catch (error) {
    console.error('Error al liberar asiento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// controllers/serviceController.js
exports.searchServices = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ message: 'Debe especificar from, to y date' });
    }

    // Buscar todos los servicios con esa fecha
    const services = await RouteBlockGenerated.find({
      date: new Date(date) // Asegúrate que en el modelo tengas el campo date
    }).populate({
      path: 'routeBlock',
      select: 'stops'
    });

    // Filtrar por orden de paradas
    const matchingServices = services.filter(service => {
      const stops = [...service.routeBlock.stops].sort((a, b) => a.order - b.order);
      const fromIndex = stops.findIndex(s => s.name === from);
      const toIndex = stops.findIndex(s => s.name === to);
      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });

    // Mapear solo IDs
    const ids = matchingServices.map(s => s._id);

    res.json({ services: ids });

  } catch (error) {
    console.error('Error buscando servicios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


