const { pool } = require('../config/database');

// Crear/Actualizar una serie o película (PUT)
const createOrUpdateMovie = async (req, res) => {
    try {
        const { id_sp, nombre, descripcion, fecha, url_foto, temporadas } = req.body;

        // Validaciones básicas
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es obligatorio'
            });
        }

        let query;
        let values;

        if (id_sp) {
            // UPDATE - Si viene el ID, actualizar registro existente
            query = `
                UPDATE serie_pelicula 
                SET nombre = ?, descripcion = ?, fecha = ?, url_foto = ?, temporadas = ?
                WHERE id_sp = ?
            `;
            values = [nombre, descripcion, fecha, url_foto, temporadas, id_sp];
        } else {
            // INSERT - Si no viene ID, crear nuevo registro
            query = `
                INSERT INTO serie_pelicula (nombre, descripcion, fecha, url_foto, temporadas)
                VALUES (?, ?, ?, ?, ?)
            `;
            values = [nombre, descripcion, fecha, url_foto, temporadas];
        }

        const [result] = await pool.execute(query, values);

        if (id_sp) {
            // Para UPDATE
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Serie/Película no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Serie/Película actualizada exitosamente',
                data: {
                    id_sp,
                    nombre,
                    descripcion,
                    fecha,
                    url_foto,
                    temporadas
                }
            });
        } else {
            // Para INSERT
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
        }

    } catch (error) {
        console.error('Error en createOrUpdateMovie:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener todas las series/películas (GET)
const getAllMovies = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM serie_pelicula ORDER BY fecha DESC');
        
        res.status(200).json({
            success: true,
            message: 'Series/Películas obtenidas exitosamente',
            data: rows
        });
    } catch (error) {
        console.error('Error en getAllMovies:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener una serie/película por ID (GET)
const getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM serie_pelicula WHERE id_sp = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Serie/Película no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Serie/Película obtenida exitosamente',
            data: rows[0]
        });
    } catch (error) {
        console.error('Error en getMovieById:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    createOrUpdateMovie,
    getAllMovies,
    getMovieById
};