import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useDarkMode } from '../hooks/useDarkMode';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AttendanceChart = ({ data = [], title = 'Attendance Trend' }) => {
  const { darkMode } = useDarkMode();

  const chartData = {
    labels: data.map(item => item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''),
    datasets: [
      {
        label: 'Present',
        data: data.map(item => item.present || 0),
        backgroundColor: '#22c55e',
        borderRadius: 4
      },
      {
        label: 'Absent',
        data: data.map(item => item.absent || 0),
        backgroundColor: '#ef4444',
        borderRadius: 4
      },
      {
        label: 'Late',
        data: data.map(item => item.late || 0),
        backgroundColor: '#f59e0b',
        borderRadius: 4
      },
      {
        label: 'Excused',
        data: data.map(item => item.excused || 0),
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151',
          usePointStyle: true
        }
      },
      title: {
        display: !!title,
        text: title,
        color: darkMode ? '#e5e7eb' : '#374151',
        font: { size: 14 }
      }
    },
    scales: {
      x: {
        grid: { color: darkMode ? '#374151' : '#e5e7eb' },
        ticks: { color: darkMode ? '#9ca3af' : '#6b7280' }
      },
      y: {
        grid: { color: darkMode ? '#374151' : '#e5e7eb' },
        ticks: { color: darkMode ? '#9ca3af' : '#6b7280', stepSize: 1 }
      }
    }
  };

  if (!data.length) {
    return (
      <div className="card">
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No attendance data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AttendanceChart;
