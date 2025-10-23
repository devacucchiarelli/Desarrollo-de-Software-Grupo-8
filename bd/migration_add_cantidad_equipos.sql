-- Migración para agregar la columna cantidad_equipos a la tabla torneos
-- Ejecutar este script si la tabla torneos ya existe sin la columna cantidad_equipos

ALTER TABLE torneos ADD COLUMN cantidad_equipos INT;

-- Comentario: Esta migración agrega la columna cantidad_equipos que permite
-- especificar cuántos equipos tendrá un torneo de formato "liga"
-- Los valores pueden ser entre 4 y 30 para torneos de liga
-- Para torneos de eliminatoria, los valores válidos son 8, 16 o 32
