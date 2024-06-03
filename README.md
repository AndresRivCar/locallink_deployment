
# LocalLink

LocalLink es una plataforma web diseñada para promocionar eventos culturales y facilitar la creación de comunidades entre usuarios con intereses comunes. A través de la plataforma, los usuarios pueden descubrir y asistir a eventos, crear grupos temáticos, y recibir recomendaciones personalizadas de eventos basadas en sus gustos y descripciones.

## Características

- **Usuarios sin autenticar**:
  - Ver eventos por categoría
  - Ver próximos eventos
  - Buscar eventos
  - Ver eventos cercanos

- **Usuarios registrados**:
  - Crear y editar su perfil
  - Crear, editar y eliminar eventos
  - Crear, editar y eliminar grupos
  - Interactuar con eventos y grupos de otras personas
  - Dejar comentarios en los eventos
  - Confirmar asistencia a eventos
  - Recibir recomendaciones personalizadas de eventos basadas en sus intereses y descripciones

### Recomendaciones personalizadas

- Para recibir recomendaciones personalizadas, es necesario estar autenticado. Las recomendaciones se basan en los intereses y descripciones de los usuarios, utilizando técnicas de web scraping con Cheerio y word embedding.

## Tecnologías utilizadas

-  [![Static Badge](https://img.shields.io/badge/EJS-black?logo=ejs)](https://ejs.co/)
- [![Static Badge](https://img.shields.io/badge/Node.js-black?logo=Node.js)](https://nodejs.org/en)
- [![Static Badge](https://img.shields.io/badge/PostgreSQL-black?logo=PostgreSQL)](https://www.postgresql.org/)
- [ ![Static Badge](https://img.shields.io/badge/Cheerio-black?logo=Cheerio)](https://cheerio.js.org/)

- [ ![Static Badge](https://img.shields.io/badge/OpenStreetMap-black?logo=openstreetmap)](https://www.openstreetmap.org/)
- [![Static Badge](https://img.shields.io/badge/Sequelize-black?logo=sequelize)](https://sequelize.org/)
- [![Static Badge](https://img.shields.io/badge/Leaflet-black?logo=leaflet)](https://leafletjs.com/)
- [![Static Badge](https://img.shields.io/badge/CSS-black?logo=css3)](https://www.w3.org/Style/CSS/)





## Instalación

1. Clona el repositorio:

    ```bash
    git clone https://github.com/AndresRivCar/locallink_deployment.git
    ```

2. Navega al directorio del proyecto:

    ```bash
    cd LocalLink
    ```

3. Instala las dependencias del proyecto:

    ```bash
    npm install
    ```

4. Configura la base de datos PostgreSQL con la extensión PostGIS:

    - Crea una base de datos en PostgreSQL.
    - Activa la extensión PostGIS en la base de datos:

    ```sql
    CREATE EXTENSION postgis;
    ```

5. Inicia el servidor de desarrollo:

    ```bash
    npm start
    ```

6. Abre tu navegador y navega a `http://localhost:5000` para ver la aplicación en acción.

## Contribuir

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -am 'Agrega nueva funcionalidad'`).
4. Sube tus cambios a tu fork (`git push origin feature/nueva-funcionalidad`).
5. Crea un Pull Request en GitHub.

