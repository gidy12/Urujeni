export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const getStatusColor = (status) => {
  const colors = {
    present: 'badge-success',
    absent: 'badge-danger',
    excused: 'badge-warning',
    late: 'badge-info',
    active: 'badge-success',
    inactive: 'badge-danger'
  };
  return colors[status] || 'badge-info';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const generatePDF = async (title, data) => {
  const response = await fetch('http://localhost:5000/api/reports/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, data, format: 'pdf' })
  });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
};
