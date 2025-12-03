// controllers/genres.controller.js
const { pool } = require('../config/database'); // Importa tu conexión a la DB

// 1. POST: Crear un nuevo género
const createGenre = async (req, res) => {
    try {
        // Asume que la tabla 'genero' tiene al menos una columna 'nombre'
        const { nombre } = req.body;

        // Validación
        if (!nombre) {
            return res.status(400).json({ message: 'El nombre del género es obligatorio' });
        }

        const query = `
            INSERT INTO genero (nombre) 
            VALUES (?)
        `;

        // Ejecutar la consulta. 'result' contendrá información como el ID insertado
        const [result] = await pool.query(query, [nombre]);

        res.status(201).json({
            message: 'Género creado exitosamente',
            id_genero: result.insertId,
            data: { nombre }
        });

    } catch (error) {
        console.error(error);
        // El error 1062 en MySQL es por duplicidad (si 'nombre' es único)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: `El género "${req.body.nombre}" ya existe.` });
        }
        res.status(500).json({ message: 'Error al crear el género', error: error.message });
    }
};

// 2. DELETE: Eliminar un género por ID
const deleteGenre = async (req, res) => {
    try {
        // El ID viene en la URL (ej: /genres/5)
        const { id } = req.params;

        // 1. Verificar si el género existe
        const [check] = await pool.query('SELECT * FROM genero WHERE id_genero = ?', [id]);
        
        if (check.length === 0) {
            return res.status(404).json({ 
                message: 'Género no encontrado' 
            });
        }

        // 2. Eliminar el género
        const [result] = await pool.query('DELETE FROM genero WHERE id_genero = ?', [id]);
        
        // Opcional: Manejo de posibles restricciones de clave foránea (FK)
        if (result.affectedRows === 0) {
             return res.status(409).json({ 
                message: 'No se puede eliminar el género porque está siendo utilizado por una o más películas.' 
             });
        }

        res.status(200).json({
            message: 'Género eliminado exitosamente',
            id_genero: id,
            deleted_genre: check[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Error al eliminar el género', 
            error: error.message 
        });
    }
};

module.exports = {
    createGenre,
    deleteGenre
    // Puedes añadir funciones para GET y PUT aquí si las necesitas más adelante
};