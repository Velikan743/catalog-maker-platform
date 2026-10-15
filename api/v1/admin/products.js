const db = require('../../../server/db');

async function readJsonBody(req) {
  let body = req.body;
  if (typeof body === 'string') return JSON.parse(body);
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString('utf8'));
  if (body && typeof body === 'object' && !Array.isArray(body)) return body;

  let rawBody = '';
  for await (const chunk of req) rawBody += chunk;
  if (!rawBody) throw new Error('Product details were not received. Please retry the save.');
  return JSON.parse(rawBody);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, message: 'Use POST to save a product.' }));
  }

  try {
    const body = await readJsonBody(req);
    if (!body.title || !body.sku || !body.category_id) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, message: 'Title, SKU, and category are required.' }));
    }
    const product = db.saveProduct(body);
    res.statusCode = 200;
    return res.end(JSON.stringify({ success: true, product }));
  } catch (err) {
    console.error('Product save failed:', err);
    res.statusCode = err instanceof SyntaxError ? 400 : 500;
    return res.end(JSON.stringify({ success: false, message: err.message || 'Failed to save product.' }));
  }
};
