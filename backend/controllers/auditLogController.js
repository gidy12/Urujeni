const AuditLog = require('../models/AuditLog');
const { paginate } = require('../utils/helpers');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, entity, page, limit } = req.query;
    const query = {};
    if (action) query.action = action;
    if (entity) query.entity = entity;

    const { skip, limit: docLimit, page: currentPage } = paginate(page, limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(docLimit),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      data: logs,
      pagination: {
        page: currentPage,
        limit: docLimit,
        total,
        pages: Math.ceil(total / docLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};
