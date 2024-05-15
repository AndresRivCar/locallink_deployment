/**
 * Module for scraping events from Comfama.
 * 
 * @module scrapers
 * 
 * @author Andres Rivra
 */

const axios = require('axios').default;
const cheerio = require('cheerio');
const https = require('https');

// URL of the webpage containing the events listing
const url = 'https://agenda.comfama.com/agenda/es/search';

/**
 * Asynchronous function for scraping events.
 *
 * @returns {Array} An array of objects representing the extracted events.
 */
async function scrapeEvents() {
  try {
    const events = await getEvents();
    // await getCategories(events); // Uncomment if you have category data
    return events;
  } catch (error) {
    console.error('Error al hacer scraping:', error);
    return [];
  }
}

/**
 * Fetches the HTML from the specified URL and uses Cheerio to extract the events.
 *
 * @returns {Array} An array of objects representing the extracted events.
 */
async function getEvents() {
  const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

  try {
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);
    return extractEvents($);
  } catch (error) {
    console.error('Error fetching HTML:', error);
    return [];
  } 
}

/**
 * Extracts the events from the specified Cheerio object.
 *
 * @param {Cheerio} $ - A Cheerio object containing the HTML of the events page.
 * @returns {Array} An array of objects representing the extracted events.
 */
function extractEvents($) {
  const baseUrl = 'https://agenda.comfama.com';
  const events = [];
  $('.results__grid .card').each((index, element) => {
    const event = {
      title: $(element).find('.card__body__link__title').text().trim(),
      date: $(element).find('.card__body__date').text().trim(),
      address: $(element).find('.card__footer__place').text().trim(),
      //category: $(element).find('.card__cat__subtitle').text().trim(),
      moreInfoLink: baseUrl + $(element).find('.card__image__link').attr('href'),
      imageUrl: baseUrl + $(element).find('.card__image img').attr('data-src'),
      origin: 'Comfama',
    };
    events.push(event);
  });
  return events;
}

// Export the scraping function
module.exports = scrapeEvents;