import React from 'react';

const StatCard = ({ icon, value, label, description, color = 'green' }) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className={`p-6 rounded-2xl border-2 ${colorClasses[color] || colorClasses.green} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
        <div className="flex-1">
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          <div className="font-semibold text-gray-700 mt-1">{label}</div>
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
