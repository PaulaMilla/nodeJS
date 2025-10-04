const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/users.controller');

// PATCH: Cambiar contraseña
router.patch('/:id/password', usuarioController.cambiarPassword);
router.post('/register', usuarioController.registrarUsuario);

module.exports = router;