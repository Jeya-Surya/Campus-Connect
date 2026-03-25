/**
 * Returns the API base URL dynamically.
 * - On localhost: uses http://localhost:8080/api (for local development)
 * - In production: uses /api (relative path, same domain)
 */
function getApiBase() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api'
    : '/api';
}

/**
 * Returns the server origin dynamically (no path).
 * Used for constructing file/media URLs.
 * - On localhost: uses http://localhost:8080
 * - In production: uses empty string (relative URLs)
 */
function getServerOrigin() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : '';
}
