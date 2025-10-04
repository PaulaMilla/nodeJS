const db = require('../config/database');
const bcrypt = require('bcrypt');

exports.registrarUsuario = async (req, res) => {
    const { rol, url_avatar, nombre, alias, correo, password } = req.body;

    if (!rol || !nombre || !alias || !correo || !password) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    try {
        // Verifica si el alias o correo ya existen
        const [usuarios] = await db.query(
            'SELECT id_usuario FROM usuario_registrado WHERE alias = ? OR correo = ?',
            [alias, correo]
        );
        if (usuarios.length > 0) {
            return res.status(409).json({ message: 'Alias o correo ya registrados' });
        }

        // Hashea la contraseña
        const hash = await bcrypt.hash(password, 10);

        // Inserta el usuario
        await db.query(
            'INSERT INTO usuario_registrado (rol, url_avatar, nombre, alias, correo, password, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, CURDATE())',
            [rol, url_avatar, nombre, alias, correo, hash]
        );

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error });
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
        const [rows] = await db.query('SELECT password FROM usuario_registrado WHERE id_usuario = ?', [id]);
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
        await db.query('UPDATE usuario_registrado SET password = ? WHERE id_usuario = ?', [hashNueva, id]);
        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar la contraseña', error });
    }
};