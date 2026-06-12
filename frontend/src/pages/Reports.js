import React, { useState } from 'react';
import { reportsAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import { FiFileText, FiDownload, FiCalendar, FiUsers, FiMapPin, FiBarChart2, FiShare2 } from 'react-icons/fi';

const reportTypes = [
  { key: 'daily', label: 'Daily Report', icon: FiCalendar, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' },
  { key: 'weekly', label: 'Weekly Report', icon: FiCalendar, color: 'bg-green-50 dark:bg-green-900/30 text-green-600' },
  { key: 'monthly', label: 'Monthly Report', icon: FiCalendar, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600' },
  { key: 'annual', label: 'Annual Report', icon: FiCalendar, color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600' },
  { key: 'members', label: 'Member Report', icon: FiUsers, color: 'bg-pink-50 dark:bg-pink-900/30 text-pink-600' },
  { key: 'gender', label: 'Gender Distribution', icon: FiBarChart2, color: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600' },
  { key: 'location', label: 'Location Report', icon: FiMapPin, color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' }
];

const Reports = () => {
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async (type) => {
    setLoading(true);
    setError('');
    setActiveReport(type);
    setReportData(null);

    try {
      let res;
      switch (type) {
        case 'daily':
        case 'weekly':
        case 'monthly':
        case 'annual':
          res = await reportsAPI.attendance({ type });
          break;
        case 'members':
          res = await reportsAPI.members();
          break;
        case 'gender':
          res = await reportsAPI.gender();
          break;
        case 'location':
          res = await reportsAPI.location();
          break;
        default:
          return;
      }
      setReportData(res.data.data);
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildWhatsAppText = () => {
    let text = `*URUJENI CULTURE TROUPE - ${activeReport?.toUpperCase()} Report*\n\n`;
    const d = reportData;
    if (!d) return text;

    switch (activeReport) {
      case 'daily':
      case 'weekly':
      case 'monthly':
      case 'annual': {
        const s = d.summary || {};
        text += `*Summary*\n`;
        text += `Total Records: ${s.total || 0}\n`;
        text += `Present: ${s.present || 0}\n`;
        text += `Absent: ${s.absent || 0}\n`;
        text += `Excused: ${s.excused || 0}\n`;
        text += `Late: ${s.late || 0}\n`;
        if (d.records?.length) {
          text += `\n*Members:*\n`;
          d.records.slice(0, 15).forEach(r => {
            text += `${r.member?.fullName || '?'} - ${r.status}\n`;
          });
          if (d.records.length > 15) text += `...and ${d.records.length - 15} more\n`;
        }
        break;
      }
      case 'members':
        text += `Total Members: ${d.totalMembers || 0}\n`;
        text += `Active: ${d.activeMembers || 0}\n`;
        text += `Inactive: ${d.inactiveMembers || 0}\n`;
        text += `Male: ${d.male || 0}\n`;
        text += `Female: ${d.female || 0}\n`;
        break;
      case 'gender':
        text += `Total: ${d.total || 0}\n`;
        text += `Male: ${d.male || 0} (${d.malePercentage || 0}%)\n`;
        text += `Female: ${d.female || 0} (${d.femalePercentage || 0}%)\n`;
        break;
      case 'location':
        if (d.byProvince) {
          text += `*By Province:*\n`;
          d.byProvince.forEach(p => { text += `${p._id}: ${p.count}\n`; });
        }
        break;
    }

    text += `\nGenerated: ${new Date().toLocaleString()}`;
    text += `\nURUJENI Management System`;
    return encodeURIComponent(text);
  };

  const handleShareWhatsApp = () => {
    const text = buildWhatsAppText();
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-gray-500 dark:text-gray-400">Generate and view reports</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {reportTypes.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => generateReport(key)}
            className={`card flex flex-col items-center gap-2 p-4 hover:shadow-md transition-shadow cursor-pointer ${
              activeReport === key ? 'ring-2 ring-primary-500' : ''
            }`}
            
          >
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon size={22} />
            </div>
            <span className="text-sm font-medium text-center">{label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">{error}</div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {reportData && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-lg font-semibold capitalize">{activeReport} Report</h2>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="btn-secondary flex items-center gap-1">
                <FiFileText size={16} /> Print
              </button>
              <button onClick={handleExportJSON} className="btn-secondary flex items-center gap-1">
                <FiDownload size={16} /> Export JSON
              </button>
              <button onClick={handleShareWhatsApp} className="btn-secondary flex items-center gap-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30">
                <FiShare2 size={16} /> WhatsApp
              </button>
            </div>
          </div>

          <div className="card">
            {renderReportContent(activeReport, reportData)}
          </div>
        </div>
      )}
    </div>
  );
};

const renderReportContent = (type, data) => {
  if (!data) return null;

  switch (type) {
    case 'daily':
    case 'weekly':
    case 'monthly':
    case 'annual':
      return <AttendanceReportView data={data} />;
    case 'members':
      return <MemberReportView data={data} />;
    case 'gender':
      return <GenderReportView data={data} />;
    case 'location':
      return <LocationReportView data={data} />;
    default:
      return <pre className="text-sm overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
  }
};

const AttendanceReportView = ({ data }) => {
  const summary = data.summary || {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Records', value: summary.total, color: '' },
          { label: 'Present', value: summary.present, color: 'text-green-600' },
          { label: 'Absent', value: summary.absent, color: 'text-red-600' },
          { label: 'Excused', value: summary.excused, color: 'text-blue-600' },
          { label: 'Late', value: summary.late, color: 'text-yellow-600' }
        ].map(item => (
          <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <p className={`text-xl font-bold ${item.color}`}>{item.value || 0}</p>
            <p className="text-xs text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      {data.records && data.records.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-2">Member</th>
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Status</th>
                <th className="text-left py-2 px-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.records.map(r => (
                <tr key={r._id} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-2 px-2">{r.member?.fullName || 'Unknown'}</td>
                  <td className="py-2 px-2 text-gray-500">{r.member?.memberId || '-'}</td>
                  <td className="py-2 px-2"><span className={r.status === 'present' ? 'badge-success' : r.status === 'absent' ? 'badge-danger' : r.status === 'late' ? 'badge-warning' : 'badge-info'}>{r.status}</span></td>
                  <td className="py-2 px-2">{formatDate(r.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MemberReportView = ({ data }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total Members', value: data.totalMembers },
        { label: 'Active', value: data.activeMembers },
        { label: 'Inactive', value: data.inactiveMembers },
        { label: 'Male', value: data.male },
        { label: 'Female', value: data.female }
      ].map(item => (
        <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold">{item.value || 0}</p>
          <p className="text-xs text-gray-500">{item.label}</p>
        </div>
      ))}
    </div>

    {data.locationStats && (
      <div>
        <h3 className="font-semibold mb-2">By Location</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-2">Province</th>
                <th className="text-left py-2 px-2">District</th>
                <th className="text-right py-2 px-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {data.locationStats.map((loc, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-2 px-2">{loc._id.province}</td>
                  <td className="py-2 px-2">{loc._id.district}</td>
                  <td className="py-2 px-2 text-right font-medium">{loc.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

const GenderReportView = ({ data }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total', value: data.total },
        { label: 'Male', value: data.male, color: 'text-blue-600' },
        { label: 'Female', value: data.female, color: 'text-pink-600' }
      ].map(item => (
        <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
          <p className={`text-xl font-bold ${item.color || ''}`}>{item.value || 0}</p>
          <p className="text-xs text-gray-500">{item.label}</p>
        </div>
      ))}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
        <div className="flex justify-center gap-4 text-sm">
          <span className="text-blue-600">{data.malePercentage}% Male</span>
          <span className="text-pink-600">{data.femalePercentage}% Female</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Distribution</p>
      </div>
    </div>
  </div>
);

const LocationReportView = ({ data }) => (
  <div className="space-y-4">
    {data.byProvince && (
      <div>
        <h3 className="font-semibold mb-2">By Province</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.byProvince.map(p => (
            <div key={p._id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="font-medium">{p._id}</p>
              <p className="text-sm text-gray-500">{p.count} members</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default Reports;
