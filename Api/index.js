import express from 'express';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = 3000;

// Configurar conexión a MySQL con pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Verificar conexión a MySQL al iniciar
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado a la base de datos MySQL');
    connection.release();
  } catch (err) {
    console.error('Error conectando a la base de datos:', err);
    process.exit(1);
  }
})();

// Rutas de la API

// Ruta base
app.get('/', (req, res) => {
  res.send('API de Artículos funcionando');
});


// Obtener todos los artículos con sus categorías
app.get('/api/articulos', async (req, res) => {
  try {
    const [resultados] = await pool.query(`
      SELECT articulos.*, categorias.nombre AS categoria_nombre 
      FROM articulos
      LEFT JOIN categorias ON articulos.categoria_id = categorias.id
    `);
    res.json(resultados);
  } catch (err) {
    res.status(500).send('Error al obtener los artículos');
  }
});

// Crear un nuevo artículo
app.post('/api/articulos', async (req, res) => {
  const { nombre, descripcion, foto, precio, medidas, en_oferta, destacado, categoria_id } = req.body;
  try {
    const [resultados] = await pool.query(
      `INSERT INTO articulos (nombre, descripcion, foto, precio, medidas, en_oferta, destacado, categoria_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, foto, precio, medidas, en_oferta || false, destacado || false, categoria_id]
    );
    res.status(201).json({ id: resultados.insertId, nombre });
  } catch (err) {
    res.status(500).send('Error al agregar el artículo');
  }
});

// Actualizar un artículo
app.put('/api/articulos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, foto, precio, medidas, en_oferta, destacado, categoria_id } = req.body;

  try {
    const [resultados] = await pool.query(
      `UPDATE articulos 
       SET nombre = ?, descripcion = ?, foto = ?, precio = ?, medidas = ?, en_oferta = ?, destacado = ?, categoria_id = ?
       WHERE id = ?`,
      [nombre, descripcion, foto, precio, medidas, en_oferta, destacado, categoria_id, id]
    );

    if (resultados.affectedRows === 0) {
      return res.status(404).send('Artículo no encontrado');
    }

    res.json({ mensaje: 'Artículo actualizado correctamente', id });
  } catch (err) {
    res.status(500).send('Error al actualizar el artículo');
  }
});

// Eliminar un artículo
app.delete('/api/articulos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [resultados] = await pool.query('DELETE FROM articulos WHERE id = ?', [id]);

    if (resultados.affectedRows === 0) {
      return res.status(404).send('Artículo no encontrado');
    }

    res.json({ mensaje: 'Artículo eliminado correctamente' });
  } catch (err) {
    res.status(500).send('Error al eliminar el artículo');
  }
});

// Obtener un artículo específico por ID
app.get('/api/articulos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [articulo] = await pool.query(`
      SELECT articulos.*, categorias.nombre AS categoria_nombre 
      FROM articulos 
      LEFT JOIN categorias ON articulos.categoria_id = categorias.id 
      WHERE articulos.id = ?`, [id]);


    if (articulo.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    res.json(articulo[0]); // Retorna el artículo encontrado
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el artículo' });
  }
});

// Obtener todas las categorías
app.get('/api/categorias', async (req, res) => {
  try {
    const [resultados] = await pool.query('SELECT * FROM categorias');
    res.json(resultados);
  } catch (err) {
    res.status(500).send('Error al obtener las categorías');
  }
});

// Crear una nueva categoría
app.post('/api/categorias', async (req, res) => {
  const { nombre } = req.body;
  try {
    const [resultados] = await pool.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
    res.status(201).json({ id: resultados.insertId, nombre });
  } catch (err) {
    res.status(500).send('Error al crear la categoría');
  }
});

// Actualizar una categoría
app.put('/api/categorias/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    const [resultados] = await pool.query(
      'UPDATE categorias SET nombre = ? WHERE id = ?',
      [nombre, id]
    );

    if (resultados.affectedRows === 0) {
      return res.status(404).send('Categoría no encontrada');
    }

    res.json({ mensaje: 'Categoría actualizada correctamente', id, nombre });
  } catch (err) {
    res.status(500).send('Error al actualizar la categoría');
  }
});

// Eliminar una categoría
app.delete('/api/categorias/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [resultados] = await pool.query('DELETE FROM categorias WHERE id = ?', [id]);

    if (resultados.affectedRows === 0) {
      return res.status(404).send('Categoría no encontrada');
    }

    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (err) {
    res.status(500).send('Error al eliminar la categoría');
  }
});

// Obtener una categoría específica por ID
app.get('/api/categorias/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [categoria] = await pool.query('SELECT * FROM categorias WHERE id = ?', [id]);

    if (categoria.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(categoria[0]); // Retorna la categoría encontrada
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la categoría' });
  }
});



// Obtener productos destacados
app.get('/api/destacados', async (req, res) => {
    try {
        const [resultados] = await pool.query(`SELECT * FROM articulos WHERE destacado = true`);
        res.json(resultados);
    } catch (err) {
        res.status(500).send('Error al obtener los productos destacados');
    }
});

// Obtener productos en oferta
app.get('/api/en-oferta', async (req, res) => {
    try {
        const [resultados] = await pool.query(`SELECT * FROM articulos WHERE en_oferta = true`);
        res.json(resultados);
    } catch (err) {
        res.status(500).send('Error al obtener los productos en oferta');
    }
});

// Other existing routes...

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
