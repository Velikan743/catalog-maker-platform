const simulateSourceChange = require('../../../server/simulateSourceChange');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, message: 'Use POST to run the mutation demo.' }));
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    } else if (Buffer.isBuffer(body)) {
      body = JSON.parse(body.toString('utf8'));
    } else if (!body || typeof body !== 'object' || Array.isArray(body)) {
      let rawBody = '';
      for await (const chunk of req) rawBody += chunk;
      body = JSON.parse(rawBody);
    }

    const externalRecord = simulateSourceChange(body);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    return res.end(JSON.stringify({
      success: true,
      message: `Change to ${sourceTypeName(body.source_type)} product ${externalRecord.id} is ready to sync.`,
      external_record: externalRecord
    }));
  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = err.statusCode || 500;
    return res.end(JSON.stringify({ success: false, message: err.message || 'Mutation demo failed.' }));
  }
};

function sourceTypeName(sourceType) {
  return sourceType === 'shopify' ? 'Shopify' : 'WooCommerce';
}
