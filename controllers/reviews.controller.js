const db = require('../config/database');

// GET - Obtener todas las reseñas
const getAllReviews = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                r.id_review,
                r.comentario,
                r.rating,
                r.cantidad_likes,
                r.fecha,
                r.spoiler,
                sp.id_sp,
                sp.nombre AS serie_pelicula,
                u.id_usuario,
                u.nombre AS usuario
            FROM review r
            JOIN review_sp rs ON r.id_review = rs.fk_review
            JOIN serie_pelicula sp ON rs.fk_sp = sp.id_sp
            JOIN usuario_review ur ON r.id_review = ur.fk_review
            JOIN usuario_registrado u ON ur.fk_usuario = u.id_usuario
            ORDER BY r.fecha DESC
        `);

        res.status(200).json({
            success: true,
            message: 'Reseñas obtenidas exitosamente',
            data: rows
        });
    } catch (error) {
        console.error('Error en getAllReviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// DELETE - Eliminar reseña por ID
const deleteReview = async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Borrar de las tablas de relación primero (por FK)
            await connection.execute('DELETE FROM usuario_review WHERE fk_review = ?', [id]);
            await connection.execute('DELETE FROM review_sp WHERE fk_review = ?', [id]);

            // Borrar de la tabla review
            const [result] = await connection.execute('DELETE FROM review WHERE id_review = ?', [id]);

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Reseña no encontrada'
                });
            }

            await connection.commit();

            res.status(200).json({
                success: true,
                message: 'Reseña eliminada correctamente'
            });
        } catch (transactionError) {
            await connection.rollback();
            throw transactionError;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error en deleteReview:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};


module.exports = {
    getAllReviews,
    deleteReview
};