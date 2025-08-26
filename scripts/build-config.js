const fs = require('fs');
const path = require('path');

// Get API key from environment variable
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

// Create config content
const configContent = `// Configuration file for API keys and other settings
// This file is auto-generated during deployment

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = '${googleMapsApiKey}';

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GOOGLE_MAPS_API_KEY };
}
`;

// Ensure js directory exists
const jsDir = path.join(__dirname, '..', 'js');
if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
}

// Write config file
const configPath = path.join(jsDir, 'config.js');
fs.writeFileSync(configPath, configContent);

console.log('✅ Config file generated successfully');
console.log(`📁 Location: ${configPath}`);
console.log(`🔑 Google Maps API Key: ${googleMapsApiKey ? 'Configured' : 'NOT CONFIGURED'}`);
