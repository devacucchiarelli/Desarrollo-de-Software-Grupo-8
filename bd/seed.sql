-- Inserta usuario administrador
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES (
  'Admin Principal',
  'admin@futbolapp.com',
  -- hash bcrypt de 'admin123'
  '$2b$10$hR03L7Yw4p7S0nM4VZ0leOMI7cp7Ab0TcsbZl1cdlIrcrQdA4yCPi',
  'administrador'
)
ON CONFLICT (email) DO NOTHING;


-- =====================================
-- === Datos de prueba para LIGA =======
-- =====================================

-- Inserta usuario administrador (ya lo tenías)
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES (
  'Admin Principal',
  'admin@futbolapp.com',
  '$2b$10$H8R03LY7w4p7S0nM4VZ0Ie0MI7cp7Ab0TcsbZl1cdIIrrcQdA4yCPi', -- hash 'admin123'
  'administrador'
)
ON CONFLICT (email) DO NOTHING;

-- ==============================
-- DATOS DE PRUEBA PARA LIGA
-- ==============================

-- Limpiar datos de negocio (no borra usuarios)
TRUNCATE tabla_posiciones, estadisticas_jugador_partido,
         partidos, equipos_torneo, equipos, torneos
RESTART IDENTITY CASCADE;

-- 1) Torneo formato liga
INSERT INTO torneos (
  nombre_torneo,
  fecha_inicio,
  fecha_fin,
  tipo_torneo,
  formato,
  cantidad_equipos
) VALUES (
  'Torneo Test Liga',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  'futbol_5',
  'liga',
  4
);

-- 2) Equipos (sin torneo directo, se enlazan por equipos_torneo)
INSERT INTO equipos (nombre_equipo) VALUES
  ('Equipo A'),
  ('Equipo B'),
  ('Equipo C'),
  ('Equipo D');

-- 3) Vincular equipos al torneo 1
INSERT INTO equipos_torneo (id_torneo, id_equipo) VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (1, 4);

-- 4) Partidos (fixture simple todos contra todos)
INSERT INTO partidos (
  id_torneo,
  fecha_partido,
  equipo_local,
  equipo_visitante,
  id_equipo_local,
  id_equipo_visitante,
  resultado_local,
  resultado_visitante
) VALUES
  (1, NOW(),                     'Equipo A', 'Equipo B', 1, 2, NULL, NULL),
  (1, NOW(),                     'Equipo C', 'Equipo D', 3, 4, NULL, NULL),
  (1, NOW() + INTERVAL '7 days', 'Equipo A', 'Equipo C', 1, 3, NULL, NULL),
  (1, NOW() + INTERVAL '7 days', 'Equipo B', 'Equipo D', 2, 4, NULL, NULL),
  (1, NOW() + INTERVAL '14 days','Equipo A', 'Equipo D', 1, 4, NULL, NULL),
  (1, NOW() + INTERVAL '14 days','Equipo B', 'Equipo C', 2, 3, NULL, NULL);
