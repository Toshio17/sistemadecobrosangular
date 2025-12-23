CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','cobrador','supervisor') NOT NULL,
  active TINYINT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_doc ENUM('DNI','RUC') NOT NULL,
  nro_doc VARCHAR(20) NOT NULL,
  nombres VARCHAR(120),
  apellidos VARCHAR(120),
  razon_social VARCHAR(200),
  direccion VARCHAR(200),
  estado VARCHAR(50),
  condicion VARCHAR(50),
  plan_id INT NULL,
  activo TINYINT DEFAULT 1,
  UNIQUE KEY uq_doc (tipo_doc, nro_doc)
);

CREATE TABLE IF NOT EXISTS mensualidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  recargo DECIMAL(10,2) DEFAULT 0,
  descuento DECIMAL(10,2) DEFAULT 0,
  fecha_vencimiento DATE NOT NULL,
  estado ENUM('pendiente','pagado','vencido') NOT NULL,
  fecha_pago DATE NULL,
  monto_pagado DECIMAL(10,2) NULL,
  metodo_pago ENUM('yape','plin','tarjeta','transferencia','efectivo') NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  destinatario VARCHAR(120) NOT NULL,
  payload JSON,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS planes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  periodo ENUM('mensual','anual') NOT NULL,
  descripcion TEXT NULL,
  activo TINYINT DEFAULT 1
);
