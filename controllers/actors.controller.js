// controllers/actors.controller.js
const { pool } = require('../config/database'); // Asegúrate de que esto importe tu conexión

// 1. POST: Crear un nuevo actor
const createActor = async (req, res) => {
    try {
        const { nombre, url_foto, nacionalidad, fecha_nacimiento } = req.body;

        // Validación básica
        if (!nombre) {
            return res.status(400).json({ message: 'El nombre es obligatorio' });
        }

        const query = `
            INSERT INTO actor (nombre, url_foto, nacionalidad, fecha_nacimiento) 
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [nombre, url_foto, nacionalidad, fecha_nacimiento]);

        res.status(201).json({
            message: 'Actor creado exitosamente',
            id_actor: result.insertId,
            data: { nombre, url_foto, nacionalidad, fecha_nacimiento }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el actor', error: error.message });
    }
};

// 2. PUT: Actualizar un actor existente
const updateActor = async (req, res) => {
    try {
        const { id } = req.params; // El ID viene en la URL (ej: /actors/1)
        const { nombre, url_foto, nacionalidad, fecha_nacimiento } = req.body;

        // Primero verificamos si el actor existe
        const [check] = await pool.query('SELECT * FROM actor WHERE id_actor = ?', [id]);
        
        if (check.length === 0) {
            return res.status(404).json({ message: 'Actor no encontrado' });
        }

        const query = `
            UPDATE actor 
            SET nombre = ?, url_foto = ?, nacionalidad = ?, fecha_nacimiento = ? 
            WHERE id_actor = ?
        `;

        await pool.query(query, [nombre, url_foto, nacionalidad, fecha_nacimiento, id]);

        res.json({
            message: 'Actor actualizado exitosamente',
            id_actor: id,
            data: { nombre, url_foto, nacionalidad, fecha_nacimiento }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el actor', error: error.message });
    }
};

// 3. GET: Obtener todos los actores
const getAllActors = async (req, res) => {
    try {
        const [actors] = await pool.query('SELECT * FROM actor');
        
        res.status(200).json({
            success: true,
            count: actors.length,
            data: actors
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Error al obtener los actores', 
            error: error.message 
        });
    }
};

// 4. DELETE: Eliminar un actor por ID
const deleteActor = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el actor existe
        const [check] = await pool.query('SELECT * FROM actor WHERE id_actor = ?', [id]);
        
        if (check.length === 0) {
            return res.status(404).json({ 
                message: 'Actor no encontrado' 
            });
        }

        // Eliminar el actor
        await pool.query('DELETE FROM actor WHERE id_actor = ?', [id]);

        res.status(200).json({
            message: 'Actor eliminado exitosamente',
            id_actor: id,
            deleted_actor: check[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Error al eliminar el actor', 
            error: error.message 
        });
    }
};

module.exports = {
    createActor,
    updateActor,
    getAllActors,
    deleteActor
};