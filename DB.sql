CREATE DATABASE IF NOT EXISTS GGart_db;
USE GGart_db;

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE articulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    foto VARCHAR(255),
    precio DECIMAL(10, 2) NOT NULL,
    medidas VARCHAR(255),
    en_oferta BOOLEAN DEFAULT FALSE,
    destacado BOOLEAN DEFAULT FALSE,
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);
ALTER TABLE articulos
ADD CONSTRAINT fk_categoria
FOREIGN KEY (categoria_id) REFERENCES categorias(id)
ON DELETE CASCADE;
alter table articulos drop column foto;
ALTER TABLE articulos ADD COLUMN stock INT NOT NULL DEFAULT 0;

CREATE TABLE imagenes_articulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    articulo_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    FOREIGN KEY (articulo_id) REFERENCES articulos(id) ON DELETE CASCADE
);


