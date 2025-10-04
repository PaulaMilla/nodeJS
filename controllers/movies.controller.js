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

// GET - Obtener todas las series/películas con información adicional
const getMovies = async (req, res) => {
    try {
        const query = `
            SELECT 
                sp.id_sp,
                sp.nombre,
                sp.descripcion,
                sp.fecha,
                sp.url_foto,
                sp.temporadas,
                GROUP_CONCAT(DISTINCT g.nombre) as generos
            FROM serie_pelicula sp
            LEFT JOIN sp_genero spg ON sp.id_sp = spg.fk_sp
            LEFT JOIN genero g ON spg.fk_genero = g.id_genero
            GROUP BY sp.id_sp
            ORDER BY sp.fecha DESC
        `;
        
        const [rows] = await pool.execute(query);
        
        // Convertir temporadas null a 0 para películas y formatear géneros
        const formattedRows = rows.map(row => ({
            ...row,
            temporadas: row.temporadas || 0,
            generos: row.generos ? row.generos.split(',') : [],
            tipo: row.temporadas > 0 ? 'serie' : 'película'
        }));
        
        res.status(200).json({
            success: true,
            data: formattedRows,
            message: 'Series y películas obtenidas exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener series/películas:', error);
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
// DELETE - Eliminar una serie/película por ID
const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si la serie/película existe
        const [existingMovie] = await pool.execute('SELECT * FROM serie_pelicula WHERE id_sp = ?', [id]);
        
        if (existingMovie.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Serie/película no encontrada'
            });
        }

        // Obtener una conexión para manejar la transacción
        const connection = await pool.getConnection();
        
        try {
            // Iniciar transacción
            await connection.beginTransaction();
            
            // Eliminar relaciones con géneros
            await connection.execute('DELETE FROM sp_genero WHERE fk_sp = ?', [id]);
            
            // Eliminar relaciones con actores
            await connection.execute('DELETE FROM actor_sp WHERE fk_sp = ?', [id]);
            
            // Eliminar relaciones con directores
            await connection.execute('DELETE FROM director_sp WHERE fk_sp = ?', [id]);
            
            // Eliminar relaciones usuario-serie/película
            await connection.execute('DELETE FROM usuario_sp WHERE fk_sp = ?', [id]);
            
            // Obtener IDs de reviews relacionadas para eliminarlas completamente
            const [reviewIds] = await connection.execute('SELECT fk_review FROM review_sp WHERE fk_sp = ?', [id]);
            
            if (reviewIds.length > 0) {
                const reviewIdsList = reviewIds.map(r => r.fk_review);
                const placeholders = reviewIdsList.map(() => '?').join(',');
                
                // Eliminar relaciones usuario-review
                await connection.execute(`DELETE FROM usuario_review WHERE fk_review IN (${placeholders})`, reviewIdsList);
                
                // Eliminar relaciones review-serie/película
                await connection.execute('DELETE FROM review_sp WHERE fk_sp = ?', [id]);
                
                // Eliminar las reviews
                await connection.execute(`DELETE FROM review WHERE id_review IN (${placeholders})`, reviewIdsList);
            }
            
            // Finalmente eliminar la serie/película
            await connection.execute('DELETE FROM serie_pelicula WHERE id_sp = ?', [id]);
            
            // Confirmar transacción
            await connection.commit();
            
            res.status(200).json({
                success: true,
                message: `${existingMovie[0].nombre} eliminada exitosamente junto con todas sus relaciones`
            });
        } catch (transactionError) {
            // Revertir transacción en caso de error
            await connection.rollback();
            throw transactionError;
        } finally {
            // Liberar la conexión
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al eliminar serie/película:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};


// Crear serie/película (POST)
const createMovie = async (req, res) => {
  try {
    const { nombre, descripcion, fecha, url_foto, temporadas } = req.body;

    // Validación básica
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es obligatorio'
      });
    }

    // Verificar si ya existe una serie/película con el mismo nombre
    const [existing] = await pool.execute(
      'SELECT id_sp FROM serie_pelicula WHERE LOWER(nombre) = LOWER(?)',
      [nombre]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `La serie/película ya existe en la base de datos`
      });
    }

    // Insertar si no existe
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
    createOrUpdateMovie,
    getMovieById,
    getMovies,
    deleteMovie,
    createMovie
}