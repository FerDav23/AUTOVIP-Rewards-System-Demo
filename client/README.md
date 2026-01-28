# Historial Mantenimiento ECIM - Frontend

Aplicación web frontend para el sistema de historial de mantenimiento ECIM con sistema de puntos y recompensas AUTOVIP.

## 🚀 Características

- **Autenticación**: Sistema de login para usuarios AUTOVIP y administradores
- **Sistema de Puntos**: Gestión de puntos y recompensas para usuarios
- **Perfil de Usuario**: Visualización y gestión de información del usuario
- **Dashboard de Administrador**: Panel de control para gestión de usuarios, recompensas y promociones
- **Responsive Design**: Diseño adaptativo para dispositivos móviles y desktop
- **Manejo de Errores**: Error boundaries y logging centralizado
- **Optimizaciones de Producción**: Build optimizado con code splitting y minificación

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Backend API corriendo (ver configuración de API URL)

## 🛠️ Instalación

1. **Clonar el repositorio** (si aplica)
   ```bash
   git clone <repository-url>
   cd frontend/client
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` y configurar:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

## 🏃 Desarrollo

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo con hot-reload
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza el build de producción localmente
- `npm run lint` - Ejecuta ESLint para verificar el código

## 🏗️ Estructura del Proyecto

```
client/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ErrorBoundary.jsx    # Manejo de errores globales
│   │   ├── Alert.jsx             # Sistema de alertas
│   │   ├── Dashboard.jsx         # Dashboard principal
│   │   ├── ManagerDashboard.jsx  # Dashboard de administrador
│   │   ├── RewardsPoints.jsx    # Sistema de puntos y recompensas
│   │   └── ...
│   ├── services/            # Servicios API
│   │   ├── apiClient.jsx         # Cliente HTTP configurado
│   │   ├── user.jsx              # Servicios de usuario
│   │   ├── autovipUsers.jsx      # Servicios AUTOVIP
│   │   └── ...
│   ├── utils/               # Utilidades
│   │   └── logger.js             # Sistema de logging
│   ├── config/              # Configuración
│   │   └── init-colors.js        # Inicialización de temas
│   ├── App.jsx              # Componente principal
│   └── main.jsx             # Punto de entrada
├── public/                  # Archivos estáticos
├── .env.example             # Ejemplo de variables de entorno
├── vite.config.js           # Configuración de Vite
└── package.json             # Dependencias y scripts
```

## 🔧 Configuración

### Variables de Entorno

El proyecto usa variables de entorno con el prefijo `VITE_`. Archivos soportados:

- `.env` - Variables para todos los entornos (local)
- `.env.local` - Variables locales (ignorado por git)
- `.env.production` - Variables para producción
- `.env.development` - Variables para desarrollo

**Prioridad**: `.env.[mode].local` > `.env.local` > `.env.[mode]` > `.env`

### Configuración de Producción

1. Crear `.env.production`:
   ```env
   VITE_API_URL=https://api.yourdomain.com/api
   ```

2. Construir para producción:
   ```bash
   npm run build
   ```

3. El build se genera en la carpeta `dist/`

## 🎨 Temas y Estilos

El sistema soporta temas dinámicos basados en el tipo de membresía del usuario:
- **Gold**: Colores dorados
- **Platinum**: Colores plateados/platinados
- **Black**: Colores negros/oscuros

Los colores se inicializan automáticamente según la membresía del usuario autenticado.

## 🔒 Seguridad

- **Tokens JWT**: Autenticación mediante tokens con expiración
- **Interceptores HTTP**: Manejo automático de tokens y errores 401/403
- **Error Boundaries**: Captura de errores de React para prevenir crashes
- **Logging**: Sistema de logging que suprime información sensible en producción

## 🐛 Manejo de Errores

### Error Boundary

La aplicación incluye un Error Boundary global que captura errores de React y muestra una interfaz amigable al usuario.

### Logging

El sistema de logging (`src/utils/logger.js`) proporciona:
- Logs en desarrollo para debugging
- Supresión de logs en producción (excepto errores)
- Preparado para integración con servicios de logging (Sentry, LogRocket, etc.)

**Uso**:
```javascript
import logger from '../utils/logger';

logger.info('Información general');
logger.warn('Advertencia');
logger.error('Error crítico');
logger.logApiError(error, { context: 'Operación específica' });
```

## 📦 Build y Despliegue

### Build de Producción

```bash
npm run build
```

El build incluye:
- ✅ Minificación de código
- ✅ Code splitting por vendor
- ✅ Optimización de assets
- ✅ Tree-shaking de código no utilizado
- ✅ Exclusión de código de desarrollo (dummy data)

### Despliegue

El contenido de la carpeta `dist/` puede ser desplegado en cualquier servidor estático:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Nginx
- Apache

## 🧪 Testing

Actualmente no hay tests configurados. Se recomienda agregar:
- Tests unitarios con Vitest o Jest
- Tests de integración
- Tests E2E con Playwright o Cypress

## 📝 Convenciones de Código

- **ESLint**: Configurado con reglas de React y mejores prácticas
- **Componentes**: Usar funciones de React (hooks)
- **Nombres**: PascalCase para componentes, camelCase para funciones
- **Imports**: Organizados por tipo (React, librerías, componentes locales, estilos)

## 🔄 Estado del Proyecto

### ✅ Completado

- [x] Sistema de autenticación
- [x] Dashboard de usuario
- [x] Sistema de puntos y recompensas
- [x] Dashboard de administrador
- [x] Error boundaries
- [x] Sistema de logging
- [x] Optimizaciones de producción
- [x] Manejo de errores HTTP global

### 🚧 Pendiente

- [ ] Tests unitarios e integración
- [ ] Integración con servicio de error tracking (Sentry)
- [ ] Documentación de API
- [ ] Mejoras de accesibilidad (a11y)
- [ ] Internacionalización (i18n)

## 🤝 Contribución

1. Crear una rama para la nueva característica
2. Realizar cambios y commits descriptivos
3. Ejecutar `npm run lint` antes de commitear
4. Crear un Pull Request

## 📄 Licencia

[Especificar licencia si aplica]

## 📞 Soporte

Para problemas o preguntas, contactar al equipo de desarrollo.

---

**Nota**: Este proyecto está en desarrollo activo. Algunas características pueden estar en construcción.
