import express from 'express';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import upload from "./upload.js";


// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = 3000;

// Configurar conexión a MySQL con pool
const pool = mysql.createPool({
    host: `localhost`, 
    user: `root`,
    password: `root`,
    database: `GGart_db`
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
app.post('/ventas', async (req, res) => {
  const { articulos } = req.body; 
  // Ahora puede contener [{ tipo: 'articulo', articulo_id, cantidad, precio_unitario }]
  // o [{ tipo: 'personalizado', nombre, descripcion, cantidad, precio_unitario }]

  if (!articulos || articulos.length === 0) {
      return res.status(400).json({ error: 'No hay artículos en la venta' });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
      // Insertar en ventas
      const [result] = await connection.query('INSERT INTO ventas (total) VALUES (0)');
      const ventaId = result.insertId;

      let totalVenta = 0;

      for (const item of articulos) {
          const { tipo, cantidad, precio_unitario } = item;

          let query, values;

          if (tipo === 'articulo') {
              const { articulo_id } = item;

              // Insertar en detalle_ventas como artículo normal
              query = 'INSERT INTO detalle_ventas (venta_id, articulo_id, cantidad, precio_unitario, tipo) VALUES (?, ?, ?, ?, ?)';
              values = [ventaId, articulo_id, cantidad, precio_unitario, 'articulo'];

              // Actualizar stock en artículos
              await connection.query(
                  'UPDATE articulos SET stock = stock - ? WHERE id = ?',
                  [cantidad, articulo_id]
              );

          } else if (tipo === 'personalizado') {
              const { nombre, descripcion } = item;

              // Insertar pedido personalizado
              const [personalizadoResult] = await connection.query(
                  'INSERT INTO pedidos_personalizados (nombre, descripcion, precio) VALUES (?, ?, ?)',
                  [nombre, descripcion, precio_unitario]
              );

              const personalizadoId = personalizadoResult.insertId;

              // Insertar en detalle_ventas como producto personalizado
              query = 'INSERT INTO detalle_ventas (venta_id, personalizado_id, cantidad, precio_unitario, tipo) VALUES (?, ?, ?, ?, ?)';
              values = [ventaId, personalizadoId, cantidad, precio_unitario, 'personalizado'];
          }

          await connection.query(query, values);
          totalVenta += cantidad * precio_unitario;
      }

      // Actualizar total de la venta
      await connection.query('UPDATE ventas SET total = ? WHERE id = ?', [totalVenta, ventaId]);

      await connection.commit();
      res.status(201).json({ message: 'Venta registrada', ventaId });
  } catch (error) {
      await connection.rollback();
      console.error(error);
      res.status(500).json({ error: 'Error al registrar la venta' });
  } finally {
      connection.release();
  }
});


app.get('/ventas', async (req, res) => {
  try {
      const [ventas] = await pool.query('SELECT * FROM ventas ORDER BY fecha DESC');
      res.json(ventas);
  } catch (error) {
      console.error('Error al obtener ventas:', error);
      res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

app.get('/ventas/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const [venta] = await pool.query('SELECT * FROM ventas WHERE id = ?', [id]);
      if (venta.length === 0) {
          return res.status(404).json({ error: 'Venta no encontrada' });
      }
      res.json(venta[0]);
  } catch (error) {
      console.error('Error al obtener la venta:', error);
      res.status(500).json({ error: 'Error al obtener la venta' });
  }
});

app.get('/ventas/:venta_id/detalle', async (req, res) => {
  const { venta_id } = req.params;

  try {
      // Consulta para obtener el detalle de la venta
      const [rows] = await pool.query(`
          SELECT 
              dv.id AS detalle_id,
              a.nombre AS articulo_nombre, 
              dv.cantidad, 
              dv.precio_unitario, 
              (dv.cantidad * dv.precio_unitario) AS subtotal
          FROM 
              detalle_ventas dv
          JOIN 
              articulos a ON dv.articulo_id = a.id
          WHERE 
              dv.venta_id = ?
      `, [venta_id]);

      if (rows.length === 0) {
          return res.status(404).json({ message: 'Venta no encontrada o sin detalles' });
      }

      return res.json(rows);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al obtener los detalles de la venta' });
  }
});

app.get('/pedidos_personalizados', async (req, res) => {
  try {
      const [rows] = await pool.query('SELECT * FROM pedidos_personalizados');
      res.json(rows);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los pedidos personalizados' });
  }
});

app.get('/pedidos_personalizados/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const [rows] = await pool.query('SELECT * FROM pedidos_personalizados WHERE id = ?', [id]);
      if (rows.length === 0) {
          return res.status(404).json({ error: 'Pedido personalizado no encontrado' });
      }
      res.json(rows[0]);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el pedido personalizado' });
  }
});

app.post('/pedidos_personalizados', async (req, res) => {
  const { nombre, descripcion, medidas, precio } = req.body;
  
  if (!nombre || !descripcion || !precio) {
      return res.status(400).json({ error: 'Los campos nombre, descripción y precio son obligatorios' });
  }

  try {
      const [result] = await pool.query(
          'INSERT INTO pedidos_personalizados (nombre, descripcion, medidas, precio) VALUES (?, ?, ?, ?)',
          [nombre, descripcion, medidas || null, precio]
      );
      res.status(201).json({ message: 'Pedido personalizado creado', id: result.insertId });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear el pedido personalizado' });
  }
});

app.put('/pedidos_personalizados/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, medidas, precio } = req.body;

  try {
      const [result] = await pool.query(
          'UPDATE pedidos_personalizados SET nombre = ?, descripcion = ?, medidas = ?, precio = ? WHERE id = ?',
          [nombre, descripcion, medidas || null, precio, id]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Pedido personalizado no encontrado' });
      }

      res.json({ message: 'Pedido personalizado actualizado' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el pedido personalizado' });
  }
});

app.delete('/pedidos_personalizados/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const [result] = await pool.query('DELETE FROM pedidos_personalizados WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Pedido personalizado no encontrado' });
      }

      res.json({ message: 'Pedido personalizado eliminado' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el pedido personalizado' });
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

// Ruta para subir imágenes
app.post("/api/upload", upload.array("photo", 5), (req, res) => {
  const urls = req.files.map((file) => file.path); // Obtiene las URLs de las imágenes
  res.json({ message: "Imágenes subidas con éxito", urls });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
