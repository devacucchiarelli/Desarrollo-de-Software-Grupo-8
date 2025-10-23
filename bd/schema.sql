-- Creación del tipo ENUM para los roles de usuario, con los roles especificados
CREATE TYPE rol_usuario AS ENUM ('capitan', 'jugador', 'administrador');

-- Usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL
);

-- Equipos
CREATE TABLE equipos (
    id_equipo SERIAL PRIMARY KEY,
    nombre_equipo VARCHAR(100) NOT NULL,
    id_capitan INT,
    CONSTRAINT fk_capitan
        FOREIGN KEY (id_capitan)
        REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL
);

-- Creación del tipo ENUM para los tipos de torneo
CREATE TYPE tipo_torneo_enum AS ENUM ('futbol_5', 'futbol_7', 'futbol_11');

-- Creación del tipo ENUM para el formato del torneo
CREATE TYPE formato_torneo_enum AS ENUM ('liga', 'eliminatoria');

-- Torneos
CREATE TABLE torneos (
    id_torneo SERIAL PRIMARY KEY,
    nombre_torneo VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    tipo_torneo tipo_torneo_enum NOT NULL,
    formato formato_torneo_enum NOT NULL
);

-- Jugadores_Equipo (tabla de unión)
CREATE TABLE jugadores_equipo (
    id_equipo INT,
    id_jugador INT,
    PRIMARY KEY (id_equipo, id_jugador),
    CONSTRAINT fk_equipo
        FOREIGN KEY (id_equipo)
        REFERENCES equipos(id_equipo)
        ON DELETE CASCADE,
    CONSTRAINT fk_jugador
        FOREIGN KEY (id_jugador)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

-- Equipos_Torneo (tabla de unión)
CREATE TABLE equipos_torneo (
    id_torneo INT,
    id_equipo INT,
    PRIMARY KEY (id_torneo, id_equipo),
    CONSTRAINT fk_torneo
        FOREIGN KEY (id_torneo)
        REFERENCES torneos(id_torneo)
        ON DELETE CASCADE,
    CONSTRAINT fk_equipo
        FOREIGN KEY (id_equipo)
        REFERENCES equipos(id_equipo)
        ON DELETE CASCADE
);

-- Partidos (Fixture)
CREATE TABLE partidos (
    id_partido SERIAL PRIMARY KEY,
    id_torneo INT NOT NULL,
    fecha_partido TIMESTAMPTZ DEFAULT NOW(),
    equipo_local VARCHAR(100) DEFAULT 'Equipo A',
    equipo_visitante VARCHAR(100) DEFAULT 'Equipo B',
    resultado_local INT DEFAULT 0,
    resultado_visitante INT DEFAULT 0,
    CONSTRAINT fk_torneo
        FOREIGN KEY (id_torneo)
        REFERENCES torneos(id_torneo)
        ON DELETE CASCADE
);