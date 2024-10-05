var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/
/**
 * FetchModel - Fetch a model from the web server.
 * @param {string} url - The URL to issue the GET request.
 * @returns {Promise} - A Promise that resolves with the parsed JSON response or rejects with an error object.
 */


function fetchModel(url) {
  return new Promise(function(resolve, reject) {
    console.log(url);
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ data: JSON.parse(xhr.responseText) });
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
          });
        }
      }
    };

    xhr.onerror = function() {
      reject({
        status: xhr.status,
        statusText: "Network Error",
      });
    };

    xhr.timeout = 5000; 
    xhr.ontimeout = function() {
      reject({
        status: xhr.status,
        statusText: "Request Timed Out",
      });
    };

    xhr.send();
  });
}

export default fetchModel;
