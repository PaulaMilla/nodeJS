const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

const registrarUsuario = async (req, res) => {
    const { rol, url_avatar, nombre, alias, correo, password } = req.body;

    if (!rol || !nombre || !alias || !correo || !password) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    try {
        // Verifica si el alias o correo ya existen
        const [usuarios] = await pool.execute(
            'SELECT id_usuario FROM usuario_registrado WHERE alias = ? OR correo = ?',
            [alias, correo]
        );
        if (usuarios.length > 0) {
            return res.status(409).json({ message: 'Alias o correo ya registrados' });
        }

        // Hashea la contraseña
        const hash = await bcrypt.hash(password, 10);

        // Inserta el usuario
        await pool.execute(
            'INSERT INTO usuario_registrado (rol, url_avatar, nombre, alias, correo, password, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, CURDATE())',
            [rol, url_avatar, nombre, alias, correo, hash]
        );

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
};

const cambiarPassword = async (req, res) => {
    const id = req.params.id;
    const { actual, nueva, repetir } = req.body;

    if (!actual || !nueva || !repetir) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    if (nueva !== repetir) {
        return res.status(400).json({ message: 'Las contraseñas nuevas no coinciden' });
    }

    try {
        // Obtener el hash actual
        const [rows] = await pool.execute('SELECT password FROM usuario_registrado WHERE id_usuario = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const hashActual = rows[0].password;
        const match = await bcrypt.compare(actual, hashActual);
        if (!match) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        // Hashear la nueva contraseña
        const hashNueva = await bcrypt.hash(nueva, 10);
        await pool.execute('UPDATE usuario_registrado SET password = ? WHERE id_usuario = ?', [hashNueva, id]);
        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar la contraseña', error });
    }
};

// PATCH - Actualizar alias de usuario
const actualizarAlias = async (req, res) => {
    const id = req.params.id;
    const { alias } = req.body;

    // Validar que se envió el alias
    if (!alias || alias.trim() === '') {
        return res.status(400).json({ 
            success: false,
            message: 'El alias es requerido' 
        });
    }

    try {
        // Verificar que el usuario existe
        const [usuario] = await pool.execute(
            'SELECT id_usuario, nombre, alias FROM usuario_registrado WHERE id_usuario = ?',
            [id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }

        // Verificar que el nuevo alias no esté en uso por otro usuario
        const [aliasExistente] = await pool.execute(
            'SELECT id_usuario FROM usuario_registrado WHERE alias = ? AND id_usuario != ?',
            [alias, id]
        );

        if (aliasExistente.length > 0) {
            return res.status(409).json({ 
                success: false,
                message: 'El alias ya está en uso por otro usuario' 
            });
        }

        // Actualizar el alias
        await pool.execute(
            'UPDATE usuario_registrado SET alias = ? WHERE id_usuario = ?',
            [alias, id]
        );

        res.status(200).json({ 
            success: true,
            message: 'Alias actualizado correctamente',
            data: {
                id_usuario: id,
                nombre: usuario[0].nombre,
                alias_anterior: usuario[0].alias,
                alias_nuevo: alias
            }
        });

    } catch (error) {
        console.error('Error al actualizar alias:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al actualizar el alias', 
            error: error.message 
        });
    }
};

// GET - Obtener todos los usuarios registrados
const obtenerTodosUsuarios = async (req, res) => {
    try {
        const [usuarios] = await pool.execute(
            'SELECT id_usuario, rol, url_avatar, nombre, alias, correo, fecha_registro FROM usuario_registrado ORDER BY fecha_registro DESC'
        );

        res.status(200).json({ 
            success: true,
            total: usuarios.length,
            data: usuarios
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener los usuarios', 
            error: error.message 
        });
    }
};

// GET - Obtener usuario registrado por ID
const obtenerUsuario = async (req, res) => {
    const id = req.params.id;

    try {
        const [usuario] = await pool.execute(
            'SELECT id_usuario, rol, url_avatar, nombre, alias, correo, fecha_registro FROM usuario_registrado WHERE id_usuario = ?',
            [id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }

        res.status(200).json({ 
            success: true,
            data: usuario[0]
        });

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener el usuario', 
            error: error.message 
        });
    }
};

// PUT - Actualizar usuario registrado
const actualizarCrearUsuario = async (req, res) => {
    const { id } = req.params;
    const { rol, url_avatar, nombre, alias, correo } = req.body;

    if (!nombre || !alias || !correo || !rol) {
        return res.status(400).json({ message: 'Faltan campos requeridos: nombre, alias, correo, rol' });
    }

    try {
        const [check] = await pool.execute(
            'SELECT * FROM usuario_registrado WHERE id_usuario = ?',
            [id]
        );

        if (check.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await pool.execute(
            'UPDATE usuario_registrado SET rol = ?, url_avatar = ?, nombre = ?, alias = ?, correo = ? WHERE id_usuario = ?',
            [rol, url_avatar, nombre, alias, correo, id]
        );

        res.status(200).json({ 
            message: 'Usuario actualizado exitosamente',
            id_usuario: id,
            data: { rol, url_avatar, nombre, alias, correo }
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
};

module.exports = {
    registrarUsuario,
    cambiarPassword,
    actualizarAlias,
    obtenerTodosUsuarios,
    obtenerUsuario,
    actualizarCrearUsuario
};