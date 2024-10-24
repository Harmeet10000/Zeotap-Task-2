/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";

const Summary = ({ weatherData, units }) => {
  const [dailySummary, setDailySummary] = useState(null);
  const [newCity, setNewCity] = useState("");
  const [userToken, setUserToken] = useState({
    email: "",
    threshold: 35,
    unit: "metric",
    cities: [],
    consecutiveExceed: 0,
    alerts: [],
  });

  // Fetch user settings from localStorage on component mount
  useEffect(() => {
    const storedToken = JSON.parse(localStorage.getItem("userToken"));
    if (storedToken) setUserToken(storedToken);
  }, []);

  // Update state whenever weatherData changes (handle both array and object)
  useEffect(() => {
    if (weatherData) {
      const data = Array.isArray(weatherData) ? weatherData : [weatherData];
      calculateDailySummary(data);
    }
  }, [weatherData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserToken((prev) => ({ ...prev, [name]: value, consecutiveExceed: 0 }));
  };

  const handleUnitChange = (e) => {
    const selectedUnit = e.target.value;
    setUserToken((prev) => ({
      ...prev,
      unit: selectedUnit,
      consecutiveExceed: 0,
    }));
  };

  const handleSave = () => {
    const trimmedCity = newCity.trim();
    if (trimmedCity && !userToken.cities.includes(trimmedCity)) {
      const updatedToken = {
        ...userToken,
        cities: [...userToken.cities, trimmedCity],
      };
      setUserToken(updatedToken);
      storeUserSettings(updatedToken);
      toast.success(`City added successfully: ${trimmedCity}`);
    } else {
      storeUserSettings(userToken);
      toast.success("Settings saved successfully!");
    }
    setNewCity("");
  };

  const storeUserSettings = (updatedToken) => {
    localStorage.setItem("userToken", JSON.stringify(updatedToken));
  };

  const convertTemperature = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    return fromUnit === "metric"
      ? (value * 9) / 5 + 32
      : ((value - 32) * 5) / 9;
  };

  const calculateDailySummary = (data) => {
    const summaries = data.map(createCitySummary);
    setDailySummary(summaries);
    storeDailySummary(summaries);
    checkThresholds(summaries);
  };

  const createCitySummary = (data) => {
    const {
      name: city,
      temp,
      temp_min,
      temp_max,
      details: weatherCondition,
    } = data;
    const temperatureUnit = units === "metric" ? "°C" : "°F";
    const reason = determineReason(weatherCondition);
    return {
      date: new Date().toLocaleDateString(),
      city,
      tempAvg: parseFloat(temp.toFixed(2)),
      tempMax: temp_max,
      tempMin: temp_min,
      dominantCondition: weatherCondition,
      reason,
      unit: temperatureUnit,
    };
  };

  const determineReason = (weatherCondition) => {
    const condition = weatherCondition.toLowerCase();
    if (condition.includes("rain")) return "Frequent rainfall observed.";
    if (condition.includes("mist") || condition.includes("haze"))
      return "Visibility is reduced due to mist/haze.";
    if (condition.includes("clear"))
      return "Clear skies with no significant weather activity.";
    if (condition.includes("cloud"))
      return "Overcast or partly cloudy conditions throughout the day.";
    return "Dominant weather condition based on observed data.";
  };

  const storeDailySummary = (summaries) => {
    const existingSummaries =
      JSON.parse(localStorage.getItem("weatherSummaries")) || [];
    existingSummaries.push(...summaries);
    localStorage.setItem("weatherSummaries", JSON.stringify(existingSummaries));
  };

  const checkThresholds = (summaries) => {
    const storedToken = JSON.parse(localStorage.getItem("userToken"));
    if (!storedToken) return;

    const threshold = convertTemperature(
      storedToken.threshold,
      storedToken.unit,
      units
    );

    const exceedCities = summaries.filter(
      (summary) =>
        (!storedToken.cities.length ||
          storedToken.cities.includes(summary.city)) &&
        summary.tempAvg > threshold
    );

    if (exceedCities.length > 0) {
      const newConsecutiveExceed = storedToken.consecutiveExceed + 1;

      const updatedAlerts = exceedCities.reduce(
        (alerts, city) => {
          const existingAlertIndex = alerts.findIndex(
            (alert) => alert.cities === city.city
          );
          if (existingAlertIndex >= 0) {
            alerts[existingAlertIndex].count += 1;
          } else {
            alerts.push({
              cities: city.city,
              count: 1,
              timestamp: new Date().toISOString(),
            });
          }
          return alerts;
        },
        [...storedToken.alerts]
      );

      setUserToken((prev) => ({
        ...prev,
        consecutiveExceed: newConsecutiveExceed,
        alerts: updatedAlerts,
      }));

      if (newConsecutiveExceed >= 2) {
        sendEmailAlert(exceedCities); // Send email alert
      } else {
        toast.warn(
          `Temperature exceeded in ${exceedCities
            .map((city) => city.city)
            .join(", ")}. Exceedance count: ${newConsecutiveExceed}`
        );
      }

      storeUserSettings({
        ...storedToken,
        consecutiveExceed: newConsecutiveExceed,
        alerts: updatedAlerts,
      });
    }
  };

  const USER_API_ID = import.meta.env.VITE_APP_USER_API_ID || "";

  const sendEmailAlert = (exceedCities) => {
    const cityNames = exceedCities
      .map((city) => `<li>${city.city}</li>`)
      .join("");
    const templateParams = { to_email: userToken.email, city_names: cityNames };
    emailjs
      .send("service_735smho", "template_b598kdu", templateParams, USER_API_ID)
      .then(() => toast.success("Email alert sent successfully!"))
      .catch(() => toast.error("Failed to send email alert."));
  };

  return (
    <div className="my-8">
      <h2 className="text-center text-2xl font-bold text-white mb-4">
        Daily Weather Summary
      </h2>
      <div className="flex flex-col items-center mb-4">
        <input
          type="text"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          placeholder="Enter city to add"
          className="mb-2 p-2 rounded bg-gray-100 w-1/2"
        />
        <div className="flex items-center w-1/2">
          <input
            type="number"
            name="threshold"
            value={userToken.threshold}
            onChange={handleInputChange}
            placeholder="Enter temperature threshold"
            className="mb-2 p-2 rounded bg-gray-100 w-1/2 mr-2"
          />
          <select
            name="unit"
            value={userToken.unit}
            onChange={handleUnitChange}
            className="mb-2 p-2 rounded bg-gray-100 w-1/2"
          >
            <option value="metric">Celsius (°C)</option>
            <option value="imperial">Fahrenheit (°F)</option>
          </select>
        </div>
        <input
          type="email"
          name="email"
          value={userToken.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          className="mb-2 p-2 rounded bg-gray-100 w-1/2"
        />
        <button
          className="bg-cyan-500 text-white px-4 py-2 rounded mt-2"
          onClick={handleSave}
        >
          Save Threshold, Cities, and Email
        </button>
      </div>

      {!dailySummary ? (
        <div className="flex justify-center items-center">
          <button
            className="bg-cyan-500 text-white px-4 py-2 rounded mb-4"
            onClick={() => calculateDailySummary(weatherData)}
          >
            Generate Daily Summary
          </button>
        </div>
      ) : (
        dailySummary.map((summary, index) => (
          <div
            key={index}
            className="bg-gray-800 text-white p-6 mb-6 rounded shadow-md w-3/4 mx-auto"
          >
            <h3 className="text-xl font-semibold mb-2">
              {summary.city} - {summary.date}
            </h3>
            <p>
              <strong>Average Temperature: </strong>
              {summary.tempAvg}
              {summary.unit}
            </p>
            <p>
              <strong>Max Temperature: </strong>
              {summary.tempMax}
              {summary.unit}
            </p>
            <p>
              <strong>Min Temperature: </strong>
              {summary.tempMin}
              {summary.unit}
            </p>
            <p>
              <strong>Dominant Weather Condition: </strong>
              {summary.dominantCondition}
            </p>
            <p>
              <strong>Reason: </strong>
              {summary.reason}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default Summary;
