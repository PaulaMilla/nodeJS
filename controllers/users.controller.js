const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

exports.registrarUsuario = async (req, res) => {
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

exports.cambiarPassword = async (req, res) => {
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
exports.actualizarAlias = async (req, res) => {
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