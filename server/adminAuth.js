const crypto = require('crypto');

function requireAdminToken(req, res, next) {
  if (req.body?.source_type !== 'shopify') return next();
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    return res.status(503).json({ success: false, message: 'Live store writes are disabled until ADMIN_API_TOKEN is configured on the server.' });
  }
  const authorization = req.headers.authorization || '';
  const provided = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
    return res.status(401).json({ success: false, message: 'Admin token is missing or invalid.' });
  }
  next();
}

module.exports = { requireAdminToken };
