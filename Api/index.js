import express from 'express';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';
import multer from 'multer';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = 23747;

// Configurar conexión a MySQL con pool
const pool = mysql.createPool({
    host: `tramway.proxy.rlwy.net`, 
    user: `root`,
    password: `JZpnHgdPhluDDBeJZDPTSwwSCPaaRVBK`,
    database: `GGart_db`,
    port: 23747
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


app.get('/api/articulos', async (req, res) => {
  try {
    const [articulos] = await pool.query(`
      SELECT 
        a.id, 
        a.nombre, 
        a.descripcion, 
        a.precio, 
        a.stock, 
        a.medidas, 
        a.en_oferta, 
        a.destacado, 
        c.nombre AS categoria,
        GROUP_CONCAT(i.url) AS imagenes
      FROM articulos a
      LEFT JOIN categorias c ON a.categoria_id = c.id
      LEFT JOIN imagenes_articulos i ON a.id = i.articulo_id
      GROUP BY a.id
    `);
    const resultados = articulos.map(articulo => ({
      ...articulo,
      imagenes: articulo.imagenes ? articulo.imagenes.split(',') : []
    }));
    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los artículos' });
  }
});

// Crear un nuevo artículo
app.post('/api/articulos', async (req, res) => {
  const { nombre, descripcion, precio, categoria_id, stock, medidas, en_oferta, destacado, imagenes } = req.body;
  console.log(req.body); // Verificar qué datos están llegando
  try {
    const [result] = await pool.query(
      'INSERT INTO articulos (nombre, descripcion, precio, categoria_id, stock, medidas, en_oferta, destacado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, categoria_id, stock, medidas, en_oferta, destacado]
    );
    const articuloId = result.insertId;
    if (imagenes && imagenes.length > 0) {
      for (const url of imagenes) {
        await pool.query('INSERT INTO imagenes_articulos (articulo_id, url) VALUES (?, ?)', [articuloId, url]);
      }
    }
    res.status(201).json({ mensaje: 'Artículo creado con éxito', articuloId });
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el artículo' });
  }
});

// Actualizar un artículo con nuevas imágenes
app.put('/api/articulos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, categoria_id, stock, medidas, en_oferta, destacado, imagenes } = req.body;

  try {
    await pool.query(
      'UPDATE articulos SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, stock = ?, medidas = ?, en_oferta = ?, destacado = ? WHERE id = ?',
      [nombre, descripcion, precio, categoria_id, stock, medidas, en_oferta, destacado, id]
    );
    await pool.query('DELETE FROM imagenes_articulos WHERE articulo_id = ?', [id]);
    if (imagenes && imagenes.length > 0) {
      for (const url of imagenes) {
        await pool.query('INSERT INTO imagenes_articulos (articulo_id, url) VALUES (?, ?)', [id, url]);
      }
    }
    res.json({ mensaje: 'Artículo actualizado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el artículo' });
  }
});

// Eliminar un artículo y sus imágenes
app.delete('/api/articulos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM articulos WHERE id = ?', [id]);
    res.json({ mensaje: 'Artículo eliminado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el artículo' });
  }
});

// Obtener un artículo por ID con sus imágenes
app.get('/api/articulos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [articulo] = await pool.query('SELECT * FROM articulos WHERE id = ?', [id]);
    if (articulo.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    const [imagenes] = await pool.query('SELECT url FROM imagenes_articulos WHERE articulo_id = ?', [id]);
    articulo[0].imagenes = imagenes.map(img => img.url);
    res.json(articulo[0]);
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

app.get('/api/articulos/categorias/:categoria_id', async (req, res) => {
  try {
    const { categoria_id } = req.params;
    const [articulos] = await pool.query(`
      SELECT 
        a.id, 
        a.nombre, 
        a.descripcion, 
        a.precio, 
        a.stock, 
        a.medidas, 
        a.en_oferta, 
        a.destacado, 
        c.nombre AS categoria,
        GROUP_CONCAT(i.url) AS imagenes
      FROM articulos a
      LEFT JOIN categorias c ON a.categoria_id = c.id
      LEFT JOIN imagenes_articulos i ON a.id = i.articulo_id
      WHERE a.categoria_id = ?
      GROUP BY a.id
    `, [categoria_id]);
    const resultados = articulos.map(articulo => ({
      ...articulo,
      imagenes: articulo.imagenes ? articulo.imagenes.split(',') : []
    }));
    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los artículos por categoría' });
  }
});



// Obtener productos destacados
app.get('/api/destacados', async (req, res) => {
  try {
    const [articulos] = await pool.query(`
      SELECT 
        a.id, 
        a.nombre, 
        a.descripcion, 
        a.precio, 
        a.stock, 
        a.medidas, 
        a.en_oferta, 
        a.destacado, 
        c.nombre AS categoria,
        GROUP_CONCAT(i.url) AS imagenes
      FROM articulos a
      LEFT JOIN categorias c ON a.categoria_id = c.id
      LEFT JOIN imagenes_articulos i ON a.id = i.articulo_id
      WHERE a.destacado = 1
      GROUP BY a.id
    `);
    const resultados = articulos.map(articulo => ({
      ...articulo,
      imagenes: articulo.imagenes ? articulo.imagenes.split(',') : []
    }));
    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los artículos destacados' });
  }
});


// Obtener productos en oferta
app.get('/api/en-oferta', async (req, res) => {
  try {
    const [articulos] = await pool.query(`
      SELECT 
        a.id, 
        a.nombre, 
        a.descripcion, 
        a.precio, 
        a.stock, 
        a.medidas, 
        a.en_oferta, 
        a.destacado, 
        c.nombre AS categoria,
        GROUP_CONCAT(i.url) AS imagenes
      FROM articulos a
      LEFT JOIN categorias c ON a.categoria_id = c.id
      LEFT JOIN imagenes_articulos i ON a.id = i.articulo_id
      WHERE a.en_oferta = 1
      GROUP BY a.id
    `);
    const resultados = articulos.map(articulo => ({
      ...articulo,
      imagenes: articulo.imagenes ? articulo.imagenes.split(',') : []
    }));
    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los artículos en oferta' });
  }
});

app.post('/api/contacto', (req, res) => {
    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'emanueltelechea05@gmail.com', // Reemplaza con tu correo
            pass: 'Diplomas' // Reemplaza con tu contraseña
        }
    });

    const mailOptions = {
        from: email,
        to: 'emanueltelechea05@gmail.com', // Reemplaza con tu correo
        subject: `Nuevo mensaje de contacto de ${name}`,
        text: `Nombre: ${name}\nCorreo: ${email}\nMensaje: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo:', error);
            res.status(500).json({ error: 'Error al enviar el correo' });
        } else {
            console.log('Correo enviado:', info.response);
            res.status(200).json({ message: 'Correo enviado con éxito' });
        }
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
