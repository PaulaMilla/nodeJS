const { pool } = require('../config/database');

// Crear serie/película (POST)
const createMovie = async (req, res) => {
    try {
        const { nombre, descripcion, fecha, url_foto, temporadas } = req.body;

        // Validaciones básicas
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es obligatorio'
            });
        }

        const query = `
            INSERT INTO serie_pelicula (nombre, descripcion, fecha, url_foto, temporadas)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [nombre, descripcion, fecha, url_foto, temporadas];

        const [result] = await pool.execute(query, values);

        res.status(201).json({
            success: true,
            message: 'Serie/Película creada exitosamente',
            data: {
                id_sp: result.insertId,
                nombre,
                descripcion,
                fecha,
                url_foto,
                temporadas
            }
        });

    } catch (error) {
        console.error('Error en createMovie:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    createMovie
};