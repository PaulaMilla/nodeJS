const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/users.controller');

// POST: Registrar usuario
router.post('/register', usuarioController.registrarUsuario);

// PATCH: Cambiar contraseña
router.patch('/:id/password', usuarioController.cambiarPassword);

// PATCH: Actualizar alias
router.patch('/:id/alias', usuarioController.actualizarAlias);

module.exports = router;