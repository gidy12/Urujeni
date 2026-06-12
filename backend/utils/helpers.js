const Member = require('../models/Member');

const generateMemberId = async () => {
  const count = await Member.countDocuments();
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(4, '0');
  return `URJ-${year}-${seq}`;
};

const paginate = (page = 1, limit = 20) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return { skip: (p - 1) * l, limit: l, page: p };
};

const getDateRange = (type) => {
  const now = new Date();
  let start, end;

  switch (type) {
    case 'daily':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      end.setDate(end.getDate() + 1);
      break;
    case 'weekly':
      const dayOfWeek = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      break;
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case 'annual':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
      break;
    default:
      start = new Date(0);
      end = new Date(8640000000000000);
  }
  return { start, end };
};

module.exports = { generateMemberId, paginate, getDateRange };
