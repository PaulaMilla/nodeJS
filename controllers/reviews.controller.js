const { pool } = require('../config/database');

// POST - Crear una nueva reseña
const createReview = async (req, res) => {
    try {
        const { sp_id, user_id, rating, comentario, spoiler } = req.body;
        
        // Validar datos requeridos
        if (!sp_id || !user_id || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Los campos sp_id (serie/película), user_id y rating son obligatorios'
            });
        }

        // Validar que el rating esté entre 0 y 10
        if (rating < 0 || rating > 10) {
            return res.status(400).json({
                success: false,
                message: 'El rating debe estar entre 0 y 10'
            });
        }

        // Verificar si la serie/película existe
        const [spExists] = await pool.execute('SELECT id_sp, nombre FROM serie_pelicula WHERE id_sp = ?', [sp_id]);
        if (spExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'La serie/película especificada no existe'
            });
        }

        // Verificar si el usuario existe
        const [userExists] = await pool.execute('SELECT id_usuario, nombre FROM usuario_registrado WHERE id_usuario = ?', [user_id]);
        if (userExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'El usuario especificado no existe'
            });
        }

        // Verificar si el usuario ya tiene una reseña para esta serie/película
        const [existingReview] = await pool.execute(`
            SELECT r.id_review 
            FROM review r
            JOIN review_sp rs ON r.id_review = rs.fk_review
            JOIN usuario_review ur ON r.id_review = ur.fk_review
            WHERE rs.fk_sp = ? AND ur.fk_usuario = ?
        `, [sp_id, user_id]);

        if (existingReview.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya tiene una reseña para esta serie/película'
            });
        }

        // Obtener una conexión para manejar la transacción
        const connection = await pool.getConnection();
        
        try {
            // Iniciar transacción
            await connection.beginTransaction();
            
            // Insertar la nueva reseña
            const [reviewResult] = await connection.execute(
                'INSERT INTO review (comentario, rating, cantidad_likes, fecha, spoiler) VALUES (?, ?, 0, CURDATE(), ?)',
                [comentario || null, rating, spoiler ? 1 : 0]
            );

            const reviewId = reviewResult.insertId;

            // Crear relación review-serie/película
            await connection.execute(
                'INSERT INTO review_sp (fk_review, fk_sp) VALUES (?, ?)',
                [reviewId, sp_id]
            );

            // Crear relación usuario-review
            await connection.execute(
                'INSERT INTO usuario_review (fk_usuario, fk_review, fecha) VALUES (?, ?, CURDATE())',
                [user_id, reviewId]
            );

            // Confirmar transacción
            await connection.commit();

            res.status(201).json({
                success: true,
                data: {
                    id_review: reviewId,
                    serie_pelicula: spExists[0].nombre,
                    usuario: userExists[0].nombre,
                    rating: rating,
                    comentario: comentario || null,
                    spoiler: spoiler ? true : false,
                    fecha: new Date().toISOString().split('T')[0]
                },
                message: 'Reseña creada exitosamente'
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
        console.error('Error al crear reseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

//PUT Review by ID
const updateReview = async (req, res) => {
    const id = req.params.id;
    const { comentario, rating, cantidad_likes, fecha, spoiler } = req.body;

    try {
        const [result] = await pool.execute(
            `UPDATE review SET comentario = ?, rating = ?, cantidad_likes = ?, fecha = ?, spoiler = ? WHERE id_review = ?`,
            [comentario, rating, cantidad_likes, fecha, spoiler, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Review no encontrada' });
        }

        res.json({ message: 'Review actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la review', error });
    }
};

// Obtener review por ID (sin joins)
const getReviewById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM review WHERE id_review = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Review no encontrada" });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
      message: "Review obtenida exitosamente"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la review",
      error,
    });
  }
};


// GET: Obtener todas las reviews
const getAllReviews = async (req, res) => {
    try {
        const [reviews] = await pool.execute('SELECT * FROM review');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las reviews', error });
    }
};

// DELETE: Eliminar una review por ID
const deleteReview = async (req, res) => {
    const id = req.params.id;

    try {
        const [result] = await pool.execute('DELETE FROM review WHERE id_review = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Review no encontrada' });
        }

        res.json({ message: 'Review eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la review', error });
    }
};

// PATCH - Actualizar comentario de una review
const updateReviewComment = async (req, res) => {
    const { id } = req.params;
    const { comentario } = req.body;

    // Validar que se envió el comentario
    if (comentario === undefined) {
        return res.status(400).json({ 
            success: false,
            message: 'El comentario es requerido' 
        });
    }

    try {
        // Verificar que la review existe
        const [review] = await pool.execute(
            'SELECT id_review, comentario, rating FROM review WHERE id_review = ?',
            [id]
        );

        if (review.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Review no encontrada' 
            });
        }

        // Actualizar el comentario
        const [result] = await pool.execute(
            'UPDATE review SET comentario = ? WHERE id_review = ?',
            [comentario, id]
        );

        res.status(200).json({ 
            success: true,
            message: 'Comentario actualizado correctamente',
            data: {
                id_review: id,
                comentario_anterior: review[0].comentario,
                comentario_nuevo: comentario,
                rating: review[0].rating
            }
        });

    } catch (error) {
        console.error('Error al actualizar comentario:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al actualizar el comentario', 
            error: error.message 
        });
    }
};

module.exports = {
    createReview,
    updateReview,
    getAllReviews,
    deleteReview,
    getReviewById,
    updateReviewComment
};