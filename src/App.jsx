import { useEffect, useState } from "react";
import Details from "./components/Details";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import getFormattedWeatherData from "./services/weatherService";

const metros = [
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bangalore",
  "Kolkata",
  "Hyderabad",
];

const App = () => {
  const [query, setQuery] = useState({ q: "" });
  const [units, setUnits] = useState("metric");
  const [weatherData, setWeatherData] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(5); // Default 5 minutes

  // Convert polling interval from minutes to milliseconds
  const intervalInMilliseconds = pollingInterval * 60 * 1000;
  console.log("App.jsx");
  const startPollingWeatherData = () => {
    const fetchWeatherForMetros = async () => {
      setLoading(true);

      try {
        const weatherPromises = metros.map((city) =>
          getFormattedWeatherData({ q: city, units })
        );
        const data = await Promise.all(weatherPromises);
        setWeatherData(data);
      } catch (error) {
        console.error("Error fetching weather for metros:", error);
        toast.error("Failed to fetch weather data for some cities.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherForMetros(); // Initial fetch

    const interval = setInterval(fetchWeatherForMetros, intervalInMilliseconds);
    return () => clearInterval(interval); // Cleanup on unmount
  };

  useEffect(() => {
    startPollingWeatherData();
  }, [units, pollingInterval]);

  useEffect(() => {
    if (!query.q && (!query.lat || !query.lon)) return;

    const fetchWeather = async () => {
      const message = query.q
        ? `Fetching weather for ${query.q}`
        : `Fetching weather for coordinates (${query.lat}, ${query.lon})`;
      toast.info(message);

      try {
        const data = await getFormattedWeatherData({ ...query, units });
        setWeather(data);
        toast.success(`Fetched weather for ${data.name}, ${data.country}`);
      } catch (error) {
        console.error("Error fetching weather:", error);
        toast.error("Failed to fetch weather data.");
      }
    };

    fetchWeather();
  }, [query, units]);

  const weatherDetails = weather || weatherData;

  return (
    <div>
      <div className="flex justify-center items-center my-4">
        <label className=" mr-2">Polling Interval (minutes):</label>
        <input
          type="number"
          value={pollingInterval}
          onChange={(e) => setPollingInterval(Number(e.target.value))}
          className="p-2 rounded bg-gray-100"
          min={1} // Minimum interval is 1 minute
        />
      </div>

      {loading ? (
        <p className="text-white text-xl text-center">
          Loading weather data...
        </p>
      ) : (
        <Details
          weatherData={weatherDetails}
          setQuery={setQuery}
          units={units}
          setUnits={setUnits}
        />
      )}

      <ToastContainer autoClose={1000} theme="colored" newestOnTop={true} />
    </div>
  );
};

export default App;
