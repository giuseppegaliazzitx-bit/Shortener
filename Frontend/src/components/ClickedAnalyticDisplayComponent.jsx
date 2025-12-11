// Frontend/src/components/LinkAnalyticsDisplay.jsx
import React, { useMemo } from 'react';
// Removed 'Link' from react-router-dom as it's no longer needed here
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

// Colors for the pie/bar charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#CC66FF', '#66CCFF', '#FF6666'];

const LinkAnalyticsDisplay = ({
  analyticsData // Now only takes analyticsData as a prop
}) => {

  // --- Data Transformations for Charts (using useMemo for efficiency) ---

  // Helper to generate categorical data for pie/bar charts
  const getCategoricalData = (key) => {
    if (!analyticsData || analyticsData.length === 0) return [];
    const distribution = analyticsData.reduce((acc, click) => {
      // Use 'Unknown' for null/undefined values to categorize them
      const category = click[key] || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(distribution).map(cat => ({
      name: cat,
      value: distribution[cat]
    }));
  };

  // Clicks Over Time (e.g., daily)
  const clicksOverTimeData = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) return [];
    const clicksByDay = analyticsData.reduce((acc, click) => {
      // Use toISOString().split('T')[0] for consistent date strings
      const date = new Date(click.clickedOn).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    // Sort by date strings to ensure chronological order
    return Object.keys(clicksByDay).sort().map(date => ({
      date: date,
      clicks: clicksByDay[date]
    }));
  }, [analyticsData]);

  // Specific data for each chart type
  const deviceTypeData = useMemo(() => getCategoricalData('deviceType'), [analyticsData]);
  const osNameData = useMemo(() => getCategoricalData('osName'), [analyticsData]);
  const browserNameData = useMemo(() => getCategoricalData('browserName'), [analyticsData]);
  const continentData = useMemo(() => getCategoricalData('continent'), [analyticsData]);
  const countryCodeData = useMemo(() => getCategoricalData('countryCode'), [analyticsData]);

  // Removed shortenedURL calculation

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Click Analytics</h2> {/* More generic title */}

      {/* Removed all linkInfo display elements (Original URL, Shortened URL, Total Clicks, Created On, Last Clicked On) */}
      {/* Removed slug editing UI */}

      {analyticsData && analyticsData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Clicks Over Time (Line Chart) */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Clicks Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={clicksOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="clicks" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Browser Usage (Pie Chart) */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Browser Usage</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={browserNameData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {browserNameData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Device Type (Bar Chart) */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Device Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deviceTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Operating System (Bar Chart) */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Operating System</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={osNameData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>

           {/* Continent Distribution (Bar Chart) */}
           <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Continent Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={continentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Country Distribution (You can use a Bar Chart for now) */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Country Distribution (Top 5)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={countryCodeData.sort((a,b) => b.value - a.value).slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#387902" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      ) : (
        <div className="text-center text-gray-500 mt-6 p-4 border rounded-md bg-gray-50">
          No click data available for this link yet.
        </div>
      )}
    </div>
  );
};

export default LinkAnalyticsDisplay;
