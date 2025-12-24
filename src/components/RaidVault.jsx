import React from 'react';

const RaidVault = ({ appData }) => {
  const { inventory } = appData;

  if (!inventory || inventory.length === 0) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Warehouse - Inventory</h2>
        <p className="text-gray-400">No inventory data available.</p>
      </div>
    );
  }

  const totalValue = inventory.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Warehouse - Inventory</h2>
        <div className="text-right">
          <p className="text-lg text-gray-400">Total Value</p>
          <p className="text-2xl font-bold text-green-400">${totalValue.toLocaleString()}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg">
          <thead>
            <tr className="bg-gray-700 text-left text-gray-300 uppercase text-sm">
              <th className="py-3 px-4">Resource</th>
              <th className="py-3 px-4 text-right">Quality</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right">Value</th>
              <th className="py-3 px-4 text-right">Value/Unit</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {inventory.map((item, index) => (
              <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="py-3 px-4 font-medium">{item.resource}</td>
                <td className="py-3 px-4 text-right">Q{item.quality}</td>
                <td className="py-3 px-4 text-right">{item.amount.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-green-400">${item.value.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-blue-400">${(item.value / item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RaidVault;

