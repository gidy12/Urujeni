const AuditLog = require('../models/AuditLog');

const auditLog = (action, entity) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async function (body) {
      if (res.statusCode < 400 && req.user) {
        try {
          await AuditLog.create({
            user: req.user._id,
            action,
            entity,
            entityId: req.params.id || body?.data?._id || body?._id,
            details: {
              method: req.method,
              path: req.originalUrl,
              body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined
            },
            ipAddress: req.ip
          });
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      }
      return originalJson(body);
    };
    next();
  };
};

function sanitizeBody(body) {
  if (!body) return {};
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.token;
  return sanitized;
}

module.exports = { auditLog };
