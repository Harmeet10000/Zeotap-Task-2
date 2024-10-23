import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

const Charts = () => {
  const [weatherSummaries, setWeatherSummaries] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Retrieve data from localStorage on component mount
  useEffect(() => {
    const storedWeather =
      JSON.parse(localStorage.getItem("weatherSummaries")) || [];
    const lastData = storedWeather.slice(-6 * 15); // Retrieve last 6 * 15 entries

    setWeatherSummaries(lastData.length ? lastData : []);

    const storedToken = JSON.parse(localStorage.getItem("userToken"));
    setAlerts(storedToken?.alerts || []);
  }, []);

  // If no weather data is available
  if (weatherSummaries.length === 0) {
    return <p className="text-center text-xl">Not enough data for charts</p>;
  }

  // Prepare datasets for the line charts (Temperature Trends)
  const cities = [...new Set(weatherSummaries.map((summary) => summary.city))];

  // Function to generate consistent colors for each city
  const getColor = (city) => {
    const colors = {
      Delhi: "#FF6384",
      Mumbai: "#36A2EB",
      Chennai: "#FFCE56",
      Bengaluru: "#4BC0C0",
      Kolkata: "#9966FF",
      Hyderabad: "#FF9F40",
    };
    return colors[city] || "#000000";
  };

const generateLineChartData = (type) => {
  const limitedWeatherSummaries = cities.reduce((acc, city) => {
    const cityEntries = weatherSummaries
      .filter((summary) => summary.city === city)
      .slice(0, 15); // Take only the first 15 entries for each city
    return [...acc, ...cityEntries];
  }, []);

  const labels = limitedWeatherSummaries
    .slice(0, 15)
    .map((_, index) => `Entry ${index + 1}`);

  return {
    labels: labels, // Only 15 labels for the x-axis
    datasets: cities.map((city) => ({
      label: `${city} ${type}`,
      data: limitedWeatherSummaries
        .filter((summary) => summary.city === city)
        .slice(0, 15) // Ensure only 15 data points per city
        .map((summary) => summary[type]),
      borderColor: getColor(city),
      fill: false,
    })),
  };
};



  const barChartData = {
    labels: alerts.map((alert) => alert.cityNames).flat(),
    datasets: [
      {
        label: "Alerts",
        data: alerts.map(() => 1), // Each alert counts as 1
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div className="my-8 bg-white ">
      <h2 className="text-center text-2xl font-bold mb-1">Charts</h2>

      {/* Line Chart: Avg Temperature */}
      <div className="mb-12" style={{ height: "400px" }}>
        <h3 className="text-center text-xl font-semibold mb-2">
          Avg Temperature Trend
        </h3>
        <Line
          data={generateLineChartData("tempAvg")}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>

      {/* Line Chart: Min Temperature */}
      <div className="mb-12" style={{ height: "400px" }}>
        <h3 className="text-center text-xl font-semibold mb-2">
          Min Temperature Trend
        </h3>
        <Line
          data={generateLineChartData("tempMin")}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>

      {/* Line Chart: Max Temperature */}
      <div className="mb-12" style={{ height: "400px" }}>
        <h3 className="text-center text-xl font-semibold mb-2">
          Max Temperature Trend
        </h3>
        <Line
          data={generateLineChartData("tempMax")}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>

      {/* Bar Chart: Alerts by City */}
      <div style={{ height: "400px" }}>
        <h3 className="text-center text-xl font-semibold mb-2">
          Alerts by City
        </h3>
        {alerts.length === 0 ? (
          <p className="text-center text-xl">
            Create alerts before seeing alert trends
          </p>
        ) : (
          <Bar
            data={barChartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        )}
      </div>
    </div>
  );
};

export default Charts;
