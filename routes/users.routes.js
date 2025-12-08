const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/users.controller');

// POST: Registrar usuario
router.post('/register', usuarioController.registrarUsuario);

// PATCH: Cambiar contraseña
router.patch('/:id/password', usuarioController.cambiarPassword);

// PATCH: Actualizar alias
router.patch('/:id/alias', usuarioController.actualizarAlias);

// GET: Obtener todos los usuarios registrados
router.get('/', usuarioController.obtenerTodosUsuarios);

// GET: Obtener usuario registrado por ID
router.get('/:id', usuarioController.obtenerUsuario);

// PUT: Actualizar usuario registrado
router.put('/:id', usuarioController.actualizarCrearUsuario);

module.exports = router;