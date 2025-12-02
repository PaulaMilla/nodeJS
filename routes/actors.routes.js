// routes/actors.routes.js
const express = require('express');
const router = express.Router();
const actorsController = require('../controllers/actors.controller');

// Ruta para crear (POST) - http://localhost:3000/actors
router.post('/', actorsController.createActor);

// Ruta para actualizar (PUT) - http://localhost:3000/actors/1
router.put('/:id', actorsController.updateActor);

// Ruta para obtener todos los actores (GET) - http://localhost:3000/actors
router.get('/', actorsController.getAllActors);

// Ruta para eliminar (DELETE) - http://localhost:3000/actors/1
router.delete('/:id', actorsController.deleteActor);

module.exports = router;