# 🏫 SEC87 — Sistema de Gestión Escolar
### Secundaria Técnica No. 87 · Secretaría de Educación Pública

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38BDF8?logo=tailwind-css)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-5.x-black?logo=express)](https://expressjs.com)

Sistema web institucional para la gestión de alumnos, asistencias, grupos y expedientes disciplinarios de la Secundaria Técnica No. 87. Diseñado con una interfaz moderna, roles diferenciados por tipo de usuario y respaldado por una base de datos en la nube (Supabase).

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características](#-características)
- [Roles de Usuario](#-roles-de-usuario)
- [Tecnologías](#-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación Local](#-instalación-local)
- [Configuración de Supabase](#-configuración-de-supabase)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Despliegue en Vercel](#-despliegue-en-vercel)
- [Importación Masiva de Alumnos](#-importación-masiva-de-alumnos)
- [Tablas de Base de Datos](#-tablas-de-base-de-datos)

---

## 📖 Descripción General

SEC87 es un sistema de gestión escolar completo que permite a directivos, prefectos y alumnos interactuar con la información institucional en tiempo real. Cuenta con un backend en Node.js + Express conectado a Supabase (PostgreSQL en la nube) y un frontend HTML/CSS/JS con diseño glassmorphism y paleta oficial SEP.

---

## ✨ Características

### Panel de Directivos
- 📊 **Dashboard** con estadísticas en tiempo real (presentes, faltas, total alumnos, asistencia promedio)
- 👥 **Gestión de Grupos** — crear, editar y eliminar grupos; asignar alumnos; promover ciclo escolar
- 🎒 **Alta de Alumnos** — individual o **importación masiva** desde Excel / CSV / Google Sheets
- 🔍 **Búsqueda Avanzada** con filtros por grado (1°, 2°, 3°) y sin grupo / recién ingreso
- 📋 **Pase de Lista Manual** — marcar asistencia/falta/retardo por grupo con justificación
- 📁 **Reportes Disciplinarios** — generar y archivar expedientes de conducta
- 📅 **Períodos Académicos** — administración de ciclos escolares

### Panel de Prefectos
- 🏠 **Panel Principal** con métricas del día
- 📷 **Escáner QR** — cámara en tiempo real para registrar entradas automáticamente
- 📋 **Pase de Lista** por grupo
- 🔍 **Búsqueda de Alumnos** — consulta rápida, ver QR y generar reporte disciplinario

### Portal de Alumnos
- 🪪 **Dashboard personal** — porcentaje de asistencia, faltas, grupo
- 📜 **Historial** de asistencias recientes
- 📰 **Anuncios** institucionales

---

## 👤 Roles de Usuario

| Rol | Acceso | Login |
|-----|--------|-------|
| **Directivo** | Panel completo de administración | Email + Contraseña |
| **Prefecto** | Escáner QR, pase de lista, búsqueda | Email + Contraseña |
| **Alumno** | Vista personal de asistencia | Matrícula |

---

## 🛠 Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, Tailwind CSS (CDN), Vanilla JavaScript (ES Modules) |
| Backend | Node.js 18+, Express 5 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Sesión en `localStorage` (auth-guard.js) |
| Escaneo QR | html5-qrcode 2.3.8 |
| Generación QR | qrcode.js (CDN) |
| Excel/CSV | xlsx (SheetJS) |
| Alertas UI | SweetAlert2 |
| Documentos | docx (generación de Word) |
| Hosting opcional | Vercel |

---

## ⚙ Requisitos

- **Node.js** v18 o superior → [Descargar](https://nodejs.org/en/download)
- **npm** (incluido con Node.js)
- Cuenta en **Supabase** (gratuita) → [supabase.com](https://supabase.com)
- Navegador moderno con soporte para cámara (Chrome recomendado para el escáner QR)

---

## 🚀 Instalación Local

### 1. Clonar o descargar el proyecto

```bash
# Opción A: clonar con Git
git clone https://github.com/TU_USUARIO/escuela87.git
cd escuela87

# Opción B: descargar ZIP y extraer en una carpeta
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear el archivo de variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_KEY=tu_clave_publica_o_service_role
PORT=3000
```

> ⚠️ **Nunca subas el archivo `.env` a GitHub.** Ya está incluido en `.gitignore`.

### 4. Iniciar el servidor

```bash
npm start
```

La aplicación estará disponible en:

```
http://localhost:3000
```

### 5. Iniciar sesión

Abre el navegador en `http://localhost:3000` y selecciona tu tipo de acceso:

- **Staff (Directivo / Prefecto):** ingresa tu correo institucional y contraseña
- **Alumno:** ingresa tu número de matrícula

---

## 🗄 Configuración de Supabase

### Crear el proyecto

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Haz clic en **"New project"**
3. Anota tu **Project URL** y tu **anon/public key** (o service_role key)
4. Pégalos en el archivo `.env`

### Crear las tablas

Ejecuta el siguiente SQL en el editor SQL de Supabase (**SQL Editor → New query**):

```sql
-- Tabla de staff (directivos y prefectos)
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('directivo', 'prefecto')),
  tipo_personal TEXT DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de alumnos
CREATE TABLE alumnos (
  id SERIAL PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  grado TEXT DEFAULT '',
  grupo TEXT DEFAULT '',
  matricula TEXT UNIQUE,
  curp TEXT UNIQUE,
  codigo_acceso UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de asistencias
CREATE TABLE asistencias (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES alumnos(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  entry_time TIME,
  status TEXT CHECK (status IN ('A tiempo', 'Retardo', 'Falta', 'Justificada')),
  justificacion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Tabla de reportes disciplinarios
CREATE TABLE reportes_disciplinarios (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES alumnos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descripcion TEXT,
  reporta_por TEXT DEFAULT 'Staff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de anuncios
CREATE TABLE anuncios (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Insertar un usuario staff de prueba

```sql
INSERT INTO staff (nombre, email, password, rol)
VALUES ('Admin Prueba', 'admin@escuela87.edu.mx', 'password123', 'directivo');

INSERT INTO staff (nombre, email, password, rol)
VALUES ('Prefecto Prueba', 'prefecto@escuela87.edu.mx', 'password123', 'prefecto');
```

---

## 📁 Estructura del Proyecto

```
escuela87/
├── 📄 index.html              # Página de login principal
├── 📄 server.js               # Backend Express + Supabase
├── 📄 package.json
├── 📄 .env                    # Variables de entorno (NO subir a Git)
├── 📄 vercel.json             # Config de despliegue en Vercel
│
├── 📂 assets/
│   ├── 📂 css/
│   │   └── style.css          # Estilos globales (glassmorphism, tokens SEP)
│   └── 📂 js/
│       ├── api-client.js      # Capa de datos (todas las llamadas a la API)
│       ├── auth-guard.js      # Protección de rutas por rol
│       ├── grupos.js          # Lógica de gestión de grupos e importación
│       ├── main.js            # Scripts globales (sidebar, mobile menu)
│       ├── supabase-client.js # Inicialización del cliente Supabase
│       └── tailwind-config.js # Tema personalizado Tailwind (colores SEP)
│
└── 📂 pages/
    ├── 📂 directivos/
    │   ├── dashboard.html     # Panel principal directivo
    │   ├── grupos.html        # Gestión de grupos y alumnos
    │   ├── asistencias.html   # Pase de lista manual
    │   ├── busqueda.html      # Búsqueda de alumnos (con editar/baja)
    │   ├── reportes.html      # Reportes disciplinarios y estadísticas
    │   └── periodos.html      # Períodos académicos
    │
    ├── 📂 prefectos/
    │   ├── dashboard.html     # Panel principal prefecto
    │   ├── escaner.html       # Escáner QR de asistencia
    │   ├── asistencias.html   # Pase de lista (solo lectura/edición básica)
    │   └── busqueda.html      # Búsqueda (solo QR y reportes)
    │
    └── 📂 alumnos/
        └── dashboard.html     # Portal del alumno
```

---

## 🌐 API Endpoints

El servidor Express expone los siguientes endpoints en `/api/`:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Estado del servidor |
| `POST` | `/api/login/staff` | Login de directivos y prefectos |
| `POST` | `/api/login/student` | Login de alumnos por matrícula |
| `GET` | `/api/alumnos` | Listar todos los alumnos |
| `POST` | `/api/alumnos` | Crear alumno individual |
| `DELETE` | `/api/alumnos/:id` | Dar de baja un alumno |
| `GET` | `/api/alumnos/:id/resumen` | Resumen de asistencia del alumno |
| `GET` | `/api/alumnos/:id/asistencias` | Historial de asistencias |
| `GET` | `/api/search/alumnos` | Búsqueda con filtros (nombre, grado, grupo) |
| `POST` | `/api/upload-alumnos` | Importación masiva desde Excel/CSV |
| `POST` | `/api/asistencias` | Registrar asistencia manual |
| `POST` | `/api/asistencias/qr` | Registrar asistencia por código QR |
| `GET` | `/api/asistencias/hoy` | Lista de asistencia del día por grupo |
| `GET` | `/api/reportes-disciplina` | Obtener reportes disciplinarios |
| `POST` | `/api/reportes-disciplina` | Crear reporte disciplinario |
| `GET` | `/api/anuncios` | Obtener anuncios institucionales |
| `POST` | `/api/anuncios` | Publicar anuncio |
| `DELETE` | `/api/anuncios/:id` | Eliminar anuncio |
| `GET` | `/api/stats/reportes` | Estadísticas globales de asistencia |

---

## 📊 Importación Masiva de Alumnos

El sistema acepta archivos **Excel (.xlsx)**, **CSV (.csv)** y **Google Sheets** (exportado como CSV o XLSX).

### Formato requerido

El archivo debe tener las siguientes columnas (los nombres son flexibles):

| Columna requerida | Nombres aceptados |
|-------------------|-------------------|
| **Nombre** ✅ | `Nombre`, `nombre_completo`, `Nombre Completo` |
| **Apellidos** ✅ | `Apellidos`, `apellidos` |
| **CURP** ✅ | `CURP`, `curp`, `Curp` |
| Grado | `Grado`, `grado` |
| Grupo | `Grupo`, `grupo` |
| Matrícula | `Matricula`, `matricula` |

> ⚠️ Los campos **Nombre, Apellidos y CURP son obligatorios**. Si falta alguno, la fila se rechaza.  
> ⚠️ No se permiten CURPs duplicados dentro del mismo archivo ni en la base de datos.

### Exportar desde Google Sheets

1. Abre tu hoja de cálculo en Google Sheets
2. Ve a **Archivo → Descargar**
3. Elige **Microsoft Excel (.xlsx)** o **Valores separados por comas (.csv)**
4. Sube el archivo en la sección de importación del sistema

---

## ☁️ Despliegue en Vercel

El proyecto está listo para desplegarse en [Vercel](https://vercel.com) (gratuito).

### Pasos

1. Instala la CLI de Vercel:
   ```bash
   npm install -g vercel
   ```

2. Ejecuta el despliegue:
   ```bash
   vercel
   ```

3. En el panel de Vercel, agrega las variables de entorno:
   - `SUPABASE_URL` → tu URL de Supabase
   - `SUPABASE_KEY` → tu clave de Supabase

4. El archivo `vercel.json` ya está configurado para redirigir todas las rutas al servidor Express.

---

## 🎨 Paleta de Colores SEP

Los colores institucionales están definidos en `assets/js/tailwind-config.js`:

| Token | Color | Uso |
|-------|-------|-----|
| `sepGreen` | `#285C4D` | Sidebar, botones primarios |
| `sepGreenDark` | `#1a3d33` | Fondo sidebar oscuro |
| `sepGold` | `#BC955C` | Acentos, ítem activo del menú |
| `sepBurgundy` | `#93222D` | Alertas, acciones destructivas |
| `sepBeige` | `#F5F0E8` | Fondo general de la app |

---

## 🔐 Seguridad

- Las sesiones se almacenan en `localStorage` y son validadas en cada página por `auth-guard.js`
- Cada página verifica el rol del usuario (`directivo`, `prefecto`, `alumno`) y redirige si no coincide
- Las contraseñas del staff se almacenan en texto plano en esta versión — **se recomienda implementar hashing (bcrypt) en producción**
- El archivo `.env` está en `.gitignore` para evitar exponer credenciales

---

## 📞 Soporte

Para dudas o reportar errores, contacta al área de sistemas de la institución.

---

> Desarrollado con ❤️ para la **Secundaria Técnica No. 87**  
> Secretaría de Educación Pública · México
