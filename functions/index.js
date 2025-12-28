/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

setGlobalOptions({maxInstances: 10});

// SimcoTools API Proxy
// Handles market data API calls to avoid CORS issues
exports.simcoApi = onRequest({
  cors: true,
  maxInstances: 5,
}, async (req, res) => {
  const path = req.query.path || "";

  // Only allow specific API endpoints for security
  const allowedPaths = [
    /^realms\/\d+\/market\/prices$/,
    /^realms\/\d+\/market\/vwaps\/.+$/,
    /^realms\/\d+\/market\/resources\/.+$/,
    /^realms\/\d+\/phases$/,
    /^realms\/\d+\/resources$/,
  ];

  const isAllowed = allowedPaths.some((pattern) => pattern.test(path));

  if (!isAllowed) {
    logger.warn("Blocked unauthorized path:", path);
    return res.status(403).json({error: "Unauthorized API path"});
  }

  try {
    const apiUrl = `https://api.simcotools.com/v1/${path}`;
    logger.info("Proxying request to:", apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      logger.error("SimcoTools API error:", response.status);
      return res.status(response.status).json({
        error: `API returned ${response.status}`,
      });
    }

    const data = await response.json();

    // Cache for 5 minutes
    res.set("Cache-Control", "public, max-age=300");
    res.json(data);
  } catch (error) {
    logger.error("Error proxying to SimcoTools API:", error);
    res.status(500).json({error: "Failed to fetch market data"});
  }
});
