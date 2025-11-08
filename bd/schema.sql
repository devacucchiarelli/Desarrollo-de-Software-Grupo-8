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
    formato formato_torneo_enum NOT NULL,
    cantidad_equipos INT DEFAULT 0
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

-- Partidos (Fixture) - ACTUALIZADO CON id_equipo_local e id_equipo_visitante
CREATE TABLE partidos (
    id_partido SERIAL PRIMARY KEY,
    id_torneo INT NOT NULL,
    fecha_partido TIMESTAMPTZ DEFAULT NOW(),
    equipo_local VARCHAR(100) DEFAULT 'Equipo A',
    equipo_visitante VARCHAR(100) DEFAULT 'Equipo B',
    id_equipo_local INT,
    id_equipo_visitante INT,
    resultado_local INT DEFAULT 0,
    resultado_visitante INT DEFAULT 0,
    CONSTRAINT fk_torneo
        FOREIGN KEY (id_torneo)
        REFERENCES torneos(id_torneo)
        ON DELETE CASCADE,
    CONSTRAINT fk_equipo_local
        FOREIGN KEY (id_equipo_local)
        REFERENCES equipos(id_equipo)
        ON DELETE SET NULL,
    CONSTRAINT fk_equipo_visitante
        FOREIGN KEY (id_equipo_visitante)
        REFERENCES equipos(id_equipo)
        ON DELETE SET NULL
);

-- Estadísticas por partido (resumen general del partido)
CREATE TABLE estadisticas_partido (
    id_estadistica_partido SERIAL PRIMARY KEY,
    id_partido INT NOT NULL UNIQUE,  -- ✅ AGREGADO UNIQUE
    id_ganador INT,
    id_goleador INT,
    goles_local INT DEFAULT 0,
    goles_visitante INT DEFAULT 0,
    amarillas_local INT DEFAULT 0,
    amarillas_visitante INT DEFAULT 0,
    rojas_local INT DEFAULT 0,
    rojas_visitante INT DEFAULT 0,
    CONSTRAINT fk_partido_estadistica
        FOREIGN KEY (id_partido)
        REFERENCES partidos(id_partido)
        ON DELETE CASCADE,
    CONSTRAINT fk_ganador_equipo
        FOREIGN KEY (id_ganador)
        REFERENCES equipos(id_equipo)
        ON DELETE SET NULL,
    CONSTRAINT fk_goleador_jugador
        FOREIGN KEY (id_goleador)
        REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL
);

-- Estadísticas por jugador en cada partido
CREATE TABLE estadisticas_jugador_partido (
    id_estadistica_jugador_partido SERIAL PRIMARY KEY,
    id_partido INT NOT NULL,
    id_jugador INT NOT NULL,
    goles INT DEFAULT 0,
    amarillas INT DEFAULT 0,
    rojas INT DEFAULT 0,
    UNIQUE (id_partido, id_jugador),  -- ✅ AGREGADO UNIQUE CONSTRAINT
    CONSTRAINT fk_partido_jugador
        FOREIGN KEY (id_partido)
        REFERENCES partidos(id_partido)
        ON DELETE CASCADE,
    CONSTRAINT fk_jugador_usuario
        FOREIGN KEY (id_jugador)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

-- Tabla de posiciones para torneos en formato liga
CREATE TABLE tabla_posiciones (
    id SERIAL PRIMARY KEY,
    id_torneo INT NOT NULL REFERENCES torneos(id_torneo) ON DELETE CASCADE,
    nombre_equipo VARCHAR(100) NOT NULL,
    pj INT DEFAULT 0,
    pg INT DEFAULT 0,
    pe INT DEFAULT 0,
    pp INT DEFAULT 0,
    gf INT DEFAULT 0,
    gc INT DEFAULT 0,
    dg INT DEFAULT 0,
    puntos INT DEFAULT 0,
    UNIQUE (id_torneo, nombre_equipo)
);
