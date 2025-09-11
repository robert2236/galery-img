📸 PicPreference - Frontend
<div align="center">
https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react
https://img.shields.io/badge/Vite-4.0.0-B73BFE?style=for-the-badge&logo=vite
https://img.shields.io/badge/Bootstrap-5.3.6-7952B3?style=for-the-badge&logo=bootstrap
https://img.shields.io/badge/Styled_Components-5.3.6-DB7093?style=for-the-badge&logo=styled-components

Sistema Inteligente de Recomendación de Imágenes

https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge
https://img.shields.io/github/last-commit/usuario/picpreference-frontend?style=for-the-badge

</div>
🚀 Características Principales
🎨 Interfaz Moderna: Diseño responsive construido con React y Bootstrap 5

🔍 Búsqueda Inteligente: Sistema de búsqueda en tiempo real con filtros avanzados

🤖 Recomendaciones Personalizadas: Integración con sistema de IA para sugerencias inteligentes

📱 Mobile First: Experiencia optimizada para dispositivos móviles

🎭 Modo Claro/Oscuro: Soporte para temas claros y oscuros

⚡ Alto Rendimiento: Optimizado con Vite para tiempos de carga rápidos

🛠️ Tecnologías Utilizadas
Tecnología	Versión	Propósito
React	18.2.0	Framework principal UI
Vite	4.0.0	Build tool y dev server
React Router DOM	6.4.5	Navegación SPA
Bootstrap	5.3.6	Framework CSS y componentes
React Bootstrap	2.10.10	Componentes Bootstrap para React
Styled Components	5.3.6	Estilos componentizados
Axios	1.11.0	Cliente HTTP para APIs
React Hook Form	7.62.0	Manejo de formularios
📦 Instalación y Uso
Prerrequisitos
bash
Node.js >= 16.0.0
npm >= 7.0.0
Instalación
bash
# Clonar repositorio
git clone https://github.com/robert2236/galery-img.git
cd picpreference-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
Variables de Entorno
env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=PicPreference
Ejecución
bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
🏗️ Estructura del Proyecto
text
src/
├── components/          # Componentes reutilizables
│   ├── Header/         # Navegación superior
│   ├── Sidebar/        # Menú lateral
│   └── MobileFooter/   # Navegación móvil
├── pages/              # Páginas principales
│   ├── Home/           # Galería principal
│   ├── Upload/         # Subida de imágenes
│   ├── Config/         # Configuración de usuario
│   └── Diagramas/      # Monitorización del sistema
├── styles/             # Estilos globales y temas
├── utils/              # Utilidades y helpers
└── Auth/               # Autenticación y manejo de tokens
🎨 Componentes Destacados
🏠 Home Page
Galería responsive con grid adaptable

Sistema de recomendaciones personalizadas

Modal interactivo con zoom y comentarios

Likes y interacciones en tiempo real

⬆️ Upload Page
Drag & drop de imágenes

Preview inmediato de archivos

Selección inteligente de categorías

Validación de formatos y tamaños

⚙️ Config Page
Edición de perfil de usuario

Gestión de preferencias

Sistema de temas claro/oscuro

Actualización de datos en tiempo real

🔌 Integración con Backend
El frontend se comunica con el backend mediante API REST:

javascript
// Ejemplo de llamada API
api.get('/api/images/search', {
  params: { q: searchTerm, page: currentPage }
})
Endpoints principales:

GET /api/images - Obtener galería de imágenes

POST /api/create_image - Subir nueva imagen

PUT /api/profile - Actualizar perfil de usuario

GET /api/recommend/{user_id} - Obtener recomendaciones

📱 Responsive Design
El diseño se adapta a todos los dispositivos:

🚀 Despliegue
Build de Producción
bash
npm run build
Despliegue en Vercel
bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
Variables de Entorno de Producción
env
VITE_API_URL=https://tu-api.com
VITE_APP_NAME=PicPreference Production

