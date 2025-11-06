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
