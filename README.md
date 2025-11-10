# Torneo de Fútbol - Grupo 8 (UTN)
Aplicación web para gestión de torneos de fútbol amateur. Permite registrar usuarios, equipos, torneos y ligas, cargar resultados y visualizar estadísticas globales y por jugador. 

Proyecto desarrollado como parte de la cátedra **Desarrollo de Software**.

##  Autores - Grupo 8

-Nico Sami Devecchi          @nicosami

-Ignacio Ruiz                @nachorruiz

-Alexis Mendez               @aleemendez

-Alejandro Gonzalez          @alegonn7

-Agustin Cucchiarelli        @devacucchiarelli


##  Funcionalidades principales

- Registro y autenticación de usuarios (jugador, capitán, administrador)
- Creación y administración de equipos
- Inscripción a equipo por link
- Inscripción a torneos
- Generación de fixtures de torneos y ligas y carga de resultados
- Visualización de estadísticas globales y por jugador
- Panel de perfil con equipo y torneos asociados

## Tecnologías

**Frontend:**
- React 18
- React Router DOM
- Fetch API
- CSS

**Backend:**
- Node.js + Express
- JWT (autenticación)
- Bcrypt (encriptación de contraseñas)
- PostgreSQL
- Docker (para base de datos)

**Infraestructura:**
- Docker Compose
- Git / GitHub

##  Instalación y ejecución

### 1.Clonar el repositorio

```bash
git clone https://github.com/devacucchiarelli/Desarrollo-de-Software-Grupo-8.git
cd Desarrollo-de-Software-Grupo-8
```
### 2.Iniciar la base de datos

Asegurarse de tener Docker y Docker Compose instalados, luego ejecutar:

```bash 
docker compose up -d
```
### 3.Ejecutar el backend

```bash
cd back
npm install
npm start
```
### 4.Ejecutar el frontend
```
cd front
npm install
npm run dev
```
La aplicación estará disponible en:

Frontend: http://localhost:5173

Backend API: http://localhost:3000




### Estructura del proyecto
Un resumen rápido de carpetas:
```markdown
##  Estructura del proyecto

Desarrollo-de-Software-Grupo-8/
├── back/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/     # Lógica de rutas
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Endpoints API
│   │   └── services/        # Lógica de negocio
│   ├── .gitignore
│   └── package.json
├── front/                   # Frontend (React)
│   ├── src/
│   │   ├── assets
│   │   ├── pages/           # Vistas principales
│   │   └── styles/          # CSS global
│   ├── public/              # Archivos estáticos
│   └── package.json
│
├── bd/                      # Base de datos
│   ├── schema.sql           # Estructura de tablas
│   ├── seed.sql             # Datos iniciales (opcional)
│   └── docker-compose.yml   # Configuración de PostgreSQL
│ 
└── README.md

```






##  Comandos útiles
```
- `npm run dev` → Inicia el frontend
- `npm start` → Inicia el backend
- `docker compose up -d` → Levanta la base de datos
- `docker compose down` → Detiene la base de datos
```
##  Licencia
Este proyecto fue desarrollado con fines académicos para la Universidad Tecnológica Nacional Facultad Regional La Plata. No posee fines comerciales.
