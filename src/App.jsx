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
const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

const App = () => {
  const [query, setQuery] = useState({ q: "" });
  const [units, setUnits] = useState("metric");
  const [weatherData, setWeatherData] = useState([]); // Collect weather data for roll-ups
  const [weather, setWeather] = useState(null); // Selected city weather
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch weather data for all metros every 5 minutes
  const startPollingWeatherData = () => {
    const fetchWeatherForMetros = async () => {
      setLoading(true);
      // let count = 0;
      // console.log("Fetching weather data for metros...", count => count + 1);
      const data = [];
      for (const city of metros) {
        try {
          const weather = await getFormattedWeatherData({ q: city, units });
          data.push(weather); // Collect weather data for each city
        } catch (error) {
          console.error(`Error fetching weather for ${city}:`, error);
        }
      }
      setWeatherData(data); // Store all collected data
      setLoading(false);
    };

    fetchWeatherForMetros(); // Initial fetch

    const interval = setInterval(fetchWeatherForMetros, POLLING_INTERVAL);
    return () => clearInterval(interval); // Cleanup interval on unmount
  };

  // Start polling on component mount
  useEffect(() => {
    console.log("saare env",import.meta.env);
    startPollingWeatherData();
  }, [units]);

  // Fetch weather for selected city when query changes
  useEffect(() => {
    if (!query.q && (!query.lat || !query.lon)) return;

    const fetchWeather = async () => {
      const message = query.q
        ? `Fetching weather for ${query.q}`
        : `Fetching weather for coordinates (${query.lat}, ${query.lon})`;
      toast.info(message);

      try {
        const data = await getFormattedWeatherData({ ...query, units });
        setWeather(data); // Store selected city weather
        toast.success(`Fetched weather for ${data.name}, ${data.country}`);
      } catch (error) {
        console.error("Error fetching weather:", error);
        toast.error("Failed to fetch weather data.");
      }
    };

    fetchWeather();
  }, [query, units]);

  const weatherDetails = weather || weatherData; // Use specific weather if query is set

  return (
    <div>
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

      <ToastContainer autoClose={3000} theme="colored" newestOnTop={true} />
    </div>
  );
};

export default App;
