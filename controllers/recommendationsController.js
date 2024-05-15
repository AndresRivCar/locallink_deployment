/**
 * Retrieves recommendations based on user interests.
 * 
 * This function fetches events from different sources, processes them, and calculates
 * their similarity to the user's interests.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * 
 * @returns {Object} The recommended events rendered as a response.
 * 
 * @throws {Error} If an error occurs while retrieving or processing events.
 * 
 * @author Andres Rivera
 */


const scraperInfolocal = require('../scrapers/scraperInfolocal');
const scraperComfama = require('../scrapers/scraperComfama');
const VectorProcessor = require('../processors/vectorProcessor');
const users = require('../models/users');
const cheerio = require('cheerio');

/**
 * Function to retrieve recommendations based on user interests.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * 
 * @returns {Object} The recommended events rendered as a response.
 */
exports.getRecommendations = async (req, res) => {
  try {
    const user = await users.findOne({ where : { id : req.params.id}});

    // Call the scraping function to get the events
    //const eventsInfolocal = await scraperInfolocal();
    //const eventsComfama = await scraperComfama();

    // Call both scraping functions simultaneously
    const [eventsInfolocal, eventsComfama] = await Promise.all([
      scraperInfolocal(),
      scraperComfama()
    ]);

    const vectorProcessor = new VectorProcessor();

    const userVector = vectorProcessor.vectorizeInterests(user.preferences);

    // Establecer el valor predeterminado
    const defaultValue = 'cine teatro música conversaciones conciertos obra';

    // Cargar el HTML en Cheerio, utilizando user.description si está definido y no vacío, de lo contrario, usar el valor predeterminado
    const $ = cheerio.load(user.description && user.description.trim() !== '' ? user.description : defaultValue);

    // load html (description) on cheerio
    //const $ = cheerio.load(user.description);

    // capture clean text
    const userDescription = $('div').text();

    const descriptionVector = vectorProcessor.vectorizeDescription(userDescription);

    const userVectorCombined = { ...userVector, ...descriptionVector };

    // Vectorize events
    const events = [...eventsInfolocal, ...eventsComfama];

    const unwantedWords = ['y', 'o', 'en', 'de', 'con', 'para', 'por', 'sobre', 'entre', 'tras', 'durante', 'según', 'mediante', 'hasta', 'si', 'no', 'ni', 'aunque', 'mientras', 'cuando', 'como'];

    const cleanedEvents = events.map(event => {
        const cleanedEvent = {};
        for (const key in event) {
            if (Object.hasOwnProperty.call(event, key)) {
                const value = event[key];
                if (typeof value === 'string') {
                    const words = value.split(' ');
                    const cleanedWords = words.map(word => {
                        const cleanedWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');

                        return unwantedWords.includes(cleanedWord.toLowerCase()) ? null : cleanedWord;
                    }).filter(Boolean);
                    cleanedEvent[key] = cleanedWords.join(' ');
                } else {
                    cleanedEvent[key] = value; // Mantener otros tipos de valores sin cambios
                }
            }
        }
        return cleanedEvent;
    });
    
    const eventsVectorized = cleanedEvents.map(cleanedEvent => vectorProcessor.vectorizeEvent(cleanedEvent));

    //const eventsVectorized = events.map((event) => vectorProcessor.vectorizeEvent(event));

    // Calculate the similarity between user interests and event characteristics
    const recommendedEvents = events.filter((event, index) => {
      const eventVector = eventsVectorized[index];
      const similarity = vectorProcessor.calculateSimilarity(userVectorCombined, eventVector);
      console.log(event.title, similarity);
      // In this line, I can "play" with the similarity to filter what I expose to the user
      return similarity > 0;
    }).sort((a, b) => {
      // Sort from highest to lowest similarity
      return vectorProcessor.calculateSimilarity(userVectorCombined, eventsVectorized[events.indexOf(b)]) -
             vectorProcessor.calculateSimilarity(userVectorCombined, eventsVectorized[events.indexOf(a)]);
    });

    //res.status(200).json({ recommendedEvents });
    res.render('recomendations', {
      pageName : 'Recomendaciones',
      recommendedEvents 
    })
  } catch (error) {
    console.error('Error al obtener los eventos:', error);
    return res.redirect('/');  
    //res.status(500).json({ error: 'Ocurrió un error al obtener los eventos.' });
  }
};