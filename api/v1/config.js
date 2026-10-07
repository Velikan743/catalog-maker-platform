const db = require('../../server/db');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const settings = db.getSettings();
    const categories = db.getCategories().filter(c => c.is_visible);
    return res.status(200).json({
      success: true,
      config: {
        catalog_name: settings.catalog_name,
        whatsapp_number: settings.whatsapp_number,
        whatsapp_message_header: settings.whatsapp_message_header,
        active_design: settings.active_design,
        currency_symbol: settings.currency_symbol,
        last_sync_time: settings.last_sync_time
      },
      categories
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
