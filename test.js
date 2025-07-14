const layoutData = require('./models/Layout'); // Ajusta la ruta si es necesario

console.log("Layouts cargados:");
console.log(Object.keys(layoutData.layouts)); // Debe incluir 'double_decker_48' o lo que esperes

console.log("Layout específico:");
console.log(layoutData.layouts['double_decker_48']); // Reemplaza por alguno que dé error