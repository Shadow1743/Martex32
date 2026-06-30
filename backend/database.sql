-- Extensión requerida para generar UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_base DECIMAL(10,2) NOT NULL,
    porcentaje_descuento DECIMAL(5,2) DEFAULT 0.00,
    imagen_url VARCHAR(255),
    categoria VARCHAR(50), -- Ej: 'Médico', 'Belleza'
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medidas (
    id SERIAL PRIMARY KEY,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_telefono VARCHAR(20),
    tipo_pieza VARCHAR(50) NOT NULL, -- 'Uniforme Completo', 'Superior', 'Inferior'
    
    -- Medidas de la parte Superior (Filipina/Gabacha)
    hombro DECIMAL(5,2),
    busto DECIMAL(5,2),
    cintura_sup DECIMAL(5,2),
    cadera_sup DECIMAL(5,2),
    largo_cintura DECIMAL(5,2),
    largo_manga DECIMAL(5,2),
    grosor_manga DECIMAL(5,2),
    largo_total_sup DECIMAL(5,2),

    -- Medidas de la parte Inferior (Pantalón/Falda)
    cintura_inf DECIMAL(5,2),
    cadera_inf DECIMAL(5,2),
    largo_rodilla DECIMAL(5,2),
    largo_total_inf DECIMAL(5,2),
    tiro DECIMAL(5,2),
    grosor_pierna DECIMAL(5,2),

    precio DECIMAL(10,2), -- Precio de confección del uniforme
    estado VARCHAR(50) DEFAULT 'Pendiente', -- Pendiente, En confección, Terminado, Entregado
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_email VARCHAR(100),
    cliente_telefono VARCHAR(20) NOT NULL,
    direccion TEXT NOT NULL,
    dui VARCHAR(20),
    metodo_pago VARCHAR(50) NOT NULL, -- 'Efectivo', 'Depósito', 'Transferencia'
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Nuevo', -- Nuevo, Procesando, Enviado, Entregado
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL
);
