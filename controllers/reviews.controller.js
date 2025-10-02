const db = require('../config/database');


//PUT Review by ID
exports.updateReview = async (req, res) => {
    const id = req.params.id;
    const { comentario, rating, cantidad_likes, fecha, spoiler } = req.body;

    try {
        const [result] = await db.query(
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