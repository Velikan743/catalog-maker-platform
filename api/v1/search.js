const db = require('../../server/db');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const q = req.query.q || '';
    if (!q.trim()) {
      return res.status(200).json({ success: true, results: [] });
    }
    const results = db.getProducts({ search: q }).slice(0, 15);
    return res.status(200).json({ success: true, query: q, results });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
