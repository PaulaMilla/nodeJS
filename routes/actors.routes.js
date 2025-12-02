// routes/actors.routes.js
const express = require('express');
const router = express.Router();
const actorsController = require('../controllers/actors.controller');

// Ruta para crear (POST) - http://localhost:3000/actors
router.post('/', actorsController.createActor);

// Ruta para actualizar (PUT) - http://localhost:3000/actors/1
router.put('/:id', actorsController.updateActor);

module.exports = router;