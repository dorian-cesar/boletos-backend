# 🚌 Sistema de Transporte de Pasajeros - Backend

## 📌 Descripción General

Este proyecto backend permite la gestión de reservas y ventas de asientos para una empresa de transporte terrestre, basada en un modelo jerárquico de **rutas maestras**, **bloques operativos** y **servicios ofertados**.

A diferencia de modelos tradicionales, la ocupación de asientos se gestiona a nivel de **bloque**, lo que permite vender boletos por tramos dentro de una misma ruta sin conflicto de reservas solapadas.

---

## 🧱 Componentes Principales

### 1. **Ruta Maestra (`RutaMaestra`)**
Define un recorrido completo entre un origen y destino con múltiples paradas intermedias, ordenadas secuencialmente.

- **Ejemplo**:  
  `Santiago → Rancagua → Talca → Concepción → Osorno → Valdivia → Puerto Montt`

- **Campos**:
  - `nombre`: `"Santiago - Puerto Montt"`
  - `paradas`: `["Santiago", "Rancagua", "Talca", "Concepción", "Osorno", "Valdivia", "Puerto Montt"]`

---

### 2. **Bloque Generado (`Bloque`)**
Un segmento dentro de una RutaMaestra, operado por un único bus en una fecha específica. A este bloque se le asigna un layout de bus y, posteriormente, una tripulación y bus físico.

- **Ejemplo**:
  - Paradas: `["Rancagua", "Talca", "Concepción", "Osorno", "Valdivia"]`
  - Fecha: `"2025-08-10"`

- **Campos**:
  - `rutaMaestraId`
  - `paradas`: subconjunto ordenado
  - `fecha`
  - `layoutBusId`
  - `busId`: (asignado 24 hrs antes)
  - `tripulacion`: lista de usuarios (choferes/auxiliares)
  - `asientos`: lista de asientos con ocupación por tramo

---

### 3. **Servicio Ofertado (`Servicio`)**
Representa un trayecto ofertado al pasajero dentro de un bloque, entre dos paradas definidas.

- **Ejemplo de Servicios para el bloque:**
  - `Rancagua → Talca`
  - `Rancagua → Concepción`
  - `Talca → Osorno`
  - `Osorno → Valdivia`

- **Campos**:
  - `bloqueId`
  - `origen`
  - `destino`
  - `horarioOrigen`
  - `horarioDestino`
  - `precio`

---

### 4. **Ocupación de Asientos (`Asientos del Bloque`)**
Cada asiento contiene la lista de tramos ya ocupados por venta o reserva, permitiendo verificar si un asiento está libre para un nuevo tramo.

- **Ejemplo**:
```json
{
  "numero": 1,
  "ocupaciones": [
    {
      "origen": "Talca",
      "destino": "Osorno",
      "estado": "vendido",
      "pasajero": { "nombre": "Juan Pérez" }
    }
  ]
}

📅 Lógica Operacional
1. Generación
Se define una RutaMaestra.

Se generan Bloques con subconjuntos de paradas y fechas específicas.

Se crean Servicios ofertados a partir de combinaciones de paradas dentro del Bloque.

2. Asignación 24 hrs antes
Se asigna:

Un bus que tenga el layout compatible.

Tripulación (choferes, auxiliares).

3. Reservas y Ventas
Se consulta la disponibilidad de un asiento en el bloque.

Se registra una reserva temporal o una venta definitiva si no hay conflicto con otros tramos ocupados.

✅ Ventajas del Modelo
Permite la venta flexible por tramos en rutas largas.

Previene sobreventa de asientos con lógica por bloque.

Escalable y modular: separa planificación de rutas, operación de buses y venta al público.

🔧 Tecnologías
Backend: Node.js + Express

Base de datos: MongoDB

ODM: Mongoose