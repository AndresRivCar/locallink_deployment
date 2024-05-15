const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https'); // Importa el módulo HTTPS

// Controlador para obtener recomendaciones
async function getRecommendations(req, res) {
    try {
        // URL específica para scraping
        const url = 'https://infolocal.comfenalcoantioquia.com/index.php/agenda';

        // Configura Axios con un agente HTTPS que no verifica el certificado
        const agent = new https.Agent({ rejectUnauthorized: false });

        // Realiza la solicitud GET con Axios utilizando el agente configurado
        const response = await axios.get(url, { httpsAgent: agent });
        const html = response.data;

        // Carga el HTML en Cheerio
        const $ = cheerio.load(html);

        const recommendations = [];

        // Encuentra los scripts que contienen JSON-LD
        $('script[type="application/ld+json"]').each((index, element) => {
            // Parsea el contenido JSON
            const data = JSON.parse($(element).html());
            recommendations.push(data);
        });

        // Envía las recomendaciones encontradas como respuesta
        res.json(recommendations);
    } catch (error) {
        console.log(error);
        // Envía un mensaje de error como respuesta
        res.status(500).json({ error: 'Error en la solicitud' });
    }
}

module.exports = {
    getRecommendations
};
