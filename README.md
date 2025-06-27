# JiraScribe Pro

JiraScribe Pro es una aplicación que integra la API de Jira y OpenAI para generar casos de prueba a partir de historias de usuario. Esta herramienta está diseñada para ayudar a los ingenieros de calidad a crear pruebas exhaustivas de manera eficiente.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales: **Backend** y **Frontend**.

### Backend

El backend está construido con Node.js y Express. Se encarga de manejar las solicitudes a las APIs de Jira y OpenAI.

- **src/index.js**: Punto de entrada del servidor. Configura Express, habilita CORS y define las rutas de la API.
- **src/config/index.js**: Carga las variables de entorno y exporta la configuración necesaria.
- **src/services/jira.service.js**: Contiene la lógica para interactuar con la API de Jira.
- **src/api/jiraRoutes.js**: Define las rutas de la API para Jira.
- **src/services/openai.service.js**: Contiene la lógica para interactuar con la API de OpenAI.
- **src/api/openaiRoutes.js**: Define las rutas de la API para OpenAI.
- **src/utils/errorHandler.js**: Funciones de ayuda para el manejo de errores.
- **.env.example**: Plantilla para las variables de entorno.
- **package.json**: Configuración de npm para el backend.

### Frontend

El frontend está construido con React y permite a los usuarios interactuar con la aplicación de manera intuitiva.

- **src/services/api.js**: Cliente Axios para interactuar con el backend.
- **src/context/AppContext.jsx**: Define el contexto de la aplicación utilizando React Context API.
- **src/App.jsx**: Componente principal de la aplicación.
- **src/components/**: Contiene los componentes reutilizables de la interfaz de usuario:
  - **ProjectSelector.jsx**: Muestra la lista de proyectos disponibles.
  - **SprintSelector.jsx**: Muestra los sprints asociados al proyecto seleccionado.
  - **StoryList.jsx**: Muestra las historias de usuario del sprint seleccionado.
  - **ActionPanel.jsx**: Contiene el botón para iniciar la generación de contenido.
  - **ResultsDisplay.jsx**: Muestra el resultado final de la generación de contenido.
- **src/index.css**: Estilos básicos para la aplicación.
- **package.json**: Configuración de npm para el frontend.

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   cd jira-scribe-pro
   ```

2. Configura el backend:
   - Navega a la carpeta `backend`:
     ```
     cd backend
     ```
   - Instala las dependencias:
     ```
     npm install
     ```
   - Crea un archivo `.env` a partir de `.env.example` y completa tus credenciales de Jira y OpenAI.
   - Inicia el servidor:
     ```
     npm start
     ```

3. Configura el frontend:
   - Navega a la carpeta `frontend`:
     ```
     cd ../frontend
     ```
   - Instala las dependencias:
     ```
     npm install
     ```
   - Inicia la aplicación:
     ```
     npm run dev
     ```

4. Abre tu navegador en la dirección que te indique la terminal del frontend (usualmente http://localhost:5173).

## Uso

Una vez que la aplicación esté en funcionamiento, podrás seleccionar un proyecto y un sprint, visualizar las historias de usuario y generar casos de prueba utilizando la inteligencia artificial de OpenAI.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.