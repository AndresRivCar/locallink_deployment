/**
 * Module for scraping events from Infolocal.
 * 
 * @module scrapers
 * 
 * @author Andres Rivra
 */

const axios = require('axios').default;
const cheerio = require('cheerio');
const https = require('https');

// URL of the webpage containing the events listing
const url = 'https://infolocal.comfenalcoantioquia.com/index.php/agenda';

/**
 * Asynchronous function for scraping events.
 * 
 * @returns {Array} An array of objects representing the extracted events.
 */
async function scrapeEvents() {
  try {
    const events = await getEvents();
    //await getCategories(events);
    return events;
  } catch (error) {
    console.error('Error al hacer scraping:', error);
    return [];
  }
}

/**
 * Asynchronous function to get events from the webpage.
 * 
 * @returns {Array} An array of objects representing the extracted events.
 */
async function getEvents() {
  const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });
  const response = await axiosInstance.get(url);
  const $ = cheerio.load(response.data);
  const events = [];

  // Array para almacenar los eventos con sus fechas correspondientes
  const eventsWithDates = [];

  // Iterar sobre los elementos .jitem-desc para obtener las fechas
  $('.jitem-desc').each((index, element) => {
    const dateText = $(element).find('.horizontal-item .icon.calendar').parent().text().trim();
    // Asegurarse de que la fecha no esté vacía antes de continuar
    if (dateText) {
      eventsWithDates.push({ date: dateText }); // Almacenar la fecha en el array
    }
  });

  // Iterar sobre los scripts para procesar los eventos
  $('script').each((index, element) => {
    const scriptContent = $(element).html();

    if (scriptContent.includes('mapInstance')) {
      const startIndex = scriptContent.indexOf('[{');
      const endIndex = scriptContent.indexOf('}],', startIndex) + 2;
      const eventsData = JSON.parse(scriptContent.substring(startIndex, endIndex));

      eventsData.forEach((event, eventIndex) => {
        const $content = $(event.content),
              address = $content.find('.address').text().trim(),
              moreInfoLink = $content.find('a').attr('href'),
              imageUrl = $content.find('.info-box-image img').attr('src'),
              origin = 'Infolocal';

        // Crear un nuevo objeto con las claves en el orden deseado
        const newEvent = { title: event.title, date: eventsWithDates[eventIndex].date, address, moreInfoLink, imageUrl, origin };
        events.push(newEvent); // Agregar el nuevo evento al array de eventos
      });
    }
  });

  return events; // Devolver solo los eventos con fechas
}



// Export the scraping function
module.exports = scrapeEvents;
