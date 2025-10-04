const { pool } = require('../config/database');

// Actualizar datos específicos de un director (PATCH)
const updateDirector = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validar que el ID sea válido
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de director inválido'
            });
        }

        // Validar que se envíen datos para actualizar
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se enviaron datos para actualizar'
            });
        }

        // Campos permitidos para actualizar
        const allowedFields = ['nombre', 'url_foto', 'nacionalidad', 'fecha_nacimiento'];
        const fieldsToUpdate = [];
        const values = [];

        // Construir la query dinámicamente solo con los campos enviados
        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                fieldsToUpdate.push(`${key} = ?`);
                values.push(value);
            }
        }

        // Validar que al menos un campo válido fue enviado
        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se enviaron campos válidos para actualizar',
                allowedFields: allowedFields
            });
        }

        // Agregar el ID al final para la cláusula WHERE
        values.push(id);

        // Construir y ejecutar la query
        const query = `UPDATE director SET ${fieldsToUpdate.join(', ')} WHERE id_director = ?`;
        const [result] = await pool.execute(query, values);

        // Verificar si el director existe
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Director no encontrado'
            });
        }

        // Obtener los datos actualizados del director
        const [updatedDirector] = await pool.execute(
            'SELECT * FROM director WHERE id_director = ?', 
            [id]
        );

        res.status(200).json({
            success: true,
            message: 'Director actualizado exitosamente',
            data: updatedDirector[0],
            fieldsUpdated: Object.keys(updateData).filter(key => allowedFields.includes(key))
        });

    } catch (error) {
        console.error('Error en updateDirector:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener todos los directores (GET)
const getAllDirectors = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM director ORDER BY nombre ASC');
        
        res.status(200).json({
            success: true,
            message: 'Directores obtenidos exitosamente',
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error en getAllDirectors:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener un director por ID (GET)
const getDirectorById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de director inválido'
            });
        }

        const [rows] = await pool.execute('SELECT * FROM director WHERE id_director = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Director no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Director obtenido exitosamente',
            data: rows[0]
        });
    } catch (error) {
        console.error('Error en getDirectorById:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener películas/series de un director (GET)
const getDirectorMovies = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de director inválido'
            });
        }

        const query = `
            SELECT 
                d.id_director,
                d.nombre as director_nombre,
                sp.id_sp,
                sp.nombre as pelicula_serie,
                sp.descripcion,
                sp.fecha,
                sp.url_foto,
                sp.temporadas
            FROM director d
            INNER JOIN director_sp ds ON d.id_director = ds.fk_director
            INNER JOIN serie_pelicula sp ON ds.fk_sp = sp.id_sp
            WHERE d.id_director = ?
            ORDER BY sp.fecha DESC
        `;

        const [rows] = await pool.execute(query, [id]);
        
        if (rows.length === 0) {
            // Verificar si el director existe
            const [directorExists] = await pool.execute(
                'SELECT nombre FROM director WHERE id_director = ?', 
                [id]
            );
            
            if (directorExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Director no encontrado'
                });
            }
            
            return res.status(200).json({
                success: true,
                message: 'Director encontrado pero no tiene películas/series asociadas',
                director: directorExists[0].nombre,
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: 'Películas/series del director obtenidas exitosamente',
            director: rows[0].director_nombre,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error en getDirectorMovies:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    updateDirector,
    getAllDirectors,
    getDirectorById,
    getDirectorMovies
};