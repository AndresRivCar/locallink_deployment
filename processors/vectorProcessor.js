/**
 * A class that provides methods for vectorizing interests and events, and calculating similarity between vectors.
 * 
 * This class contains methods to convert user interests and event characteristics into vectors, and to calculate the similarity between these vectors.
 * 
 * @class VectorProcessor
 * 
 * @exports VectorProcessor
 * 
 * @author Andres Rivra
 */

class VectorProcessor {
    /**
     * Converts a list of interests into a vector representation.
     * 
     * This method takes a list of interests and converts them into a vector representation,
     * where each interest contributes equally to the vector.
     * 
     * @param {Array.<string>} interests - The list of interests to be converted into a vector.
     * 
     * @returns {Object} The vector representation of the interests.
     */  
    vectorizeInterests(interests) {
      const interestVector = {};
      interests.forEach((interest) => {
        // Assuming that each word of interest contributes equally to the vector
        interestVector[interest] = 1;
      });
      return interestVector;
    }

    vectorizeDescription(description) {
      const vector = {};
      const words = description.split(/\s+/); // Dividir el texto en palabras
  
      // Contar la frecuencia de cada palabra
      words.forEach(word => {
          vector[word] = (vector[word] || 0) + 1;
      });
  
      return vector;
  }

    /**
     * Converts an event object into a vector representation.
     * 
     * This method takes an event object and converts its title and category into a vector
     * representation, where each word from the title and category contributes equally to the vector.
     * 
     * @param {Object} event - The event object to be converted into a vector.
     * 
     * @returns {Object} The vector representation of the event.
     */
    vectorizeEvent(event) {
        const eventVector = {};
    
        // Function to remove accents from a word
        const removeAccents = (word) => {
          return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };
    
        const title = event
        .title ? event.title.toLowerCase() : '';
        const wordsFromTitle = title.split(' ');
        wordsFromTitle.forEach((word) => {
          const wordWithoutAccents = removeAccents(word);
          // Assuming that each word in the title contributes equally to the vector
          eventVector[wordWithoutAccents] = 1;
        });
    
        /*const category = event.category ? event.category.toLowerCase() : '';
        const wordsFromCategory = category.split(' ');
        wordsFromCategory.forEach((word) => {
          const wordWithoutAccents = removeAccents(word);
          // Assuming that each word in the category contributes equally to the vector
          eventVector[wordWithoutAccents] = 1;
        });*/
    
        return eventVector;
      }
  
    /**
     * Calculates the similarity between two vectors.
     * 
     * This method computes the cosine similarity between two vectors, which represents how similar these vectors
     * are in direction and magnitude.
     * 
     * @param {Object} vector1 - The first vector.
     * @param {Object} vector2 - The second vector.
     * 
     * @returns {number} The cosine similarity between the two vectors, ranging from -1 (completely dissimilar)
     * to 1 (completely similar).
     */
    calculateSimilarity(vector1, vector2) {
      const keys = new Set([...Object.keys(vector1), ...Object.keys(vector2)]);
      let dotProduct = 0;
      let magnitude1 = 0;
      let magnitude2 = 0;
      keys.forEach((key) => {
        dotProduct += (vector1[key] || 0) * (vector2[key] || 0);
        magnitude1 += Math.pow(vector1[key] || 0, 2);
        magnitude2 += Math.pow(vector2[key] || 0, 2);
      });
      magnitude1 = Math.sqrt(magnitude1);
      magnitude2 = Math.sqrt(magnitude2);
      const similarity = dotProduct / (magnitude1 * magnitude2);
      return similarity;
    }
  }
  
  module.exports = VectorProcessor;