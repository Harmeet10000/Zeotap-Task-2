/* eslint-disable no-prototype-builtins */
/* eslint-disable react/prop-types */
import {
  UilTemperature,
  UilTear,
  UilWind,
  UilSun,
  UilSunset,
} from "@iconscout/react-unicons";
import { formatToLocalTime, iconUrlFromCode } from "../services/weatherService";
import TopButtons from "./TopButtons";
import Inputs from "./Inputs";
import Summary from "./Summary";
import Charts from "./Charts";

const Details = ({ weatherData, units, setQuery, setUnits }) => {
  // console.log("Details", weatherData);

  // Function to handle background formatting based on weather data
  const formatBackground = (weatherDetails) => {
    const cityWeather = weatherDetails.hasOwnProperty("lat")
      ? weatherDetails
      : Object.values(weatherDetails)[0]; // Default to first city if multiple cities

    // console.log("cityWeather", cityWeather);

    if (!cityWeather) return "from-cyan-700 to-blue-700"; // Default background

    const threshold = units === "metric" ? 20 : 60;
    return cityWeather.temp <= threshold
      ? "from-cyan-700 to-blue-700"
      : "from-yellow-700 to-orange-700";
  };

  // Helper function to render weather details for a city
  const renderCityWeather = (cityKey, data) => {
    const {
      temp,
      feels_like,
      temp_min,
      temp_max,
      humidity,
      speed,
      sunrise,
      sunset,
      timezone,
      details,
      icon,
      name,
      country,
      dt,
    } = data;

    return (
      <div key={cityKey} className="my-8">
        <div className="flex items-center justify-center my-6">
          <p className="text-white text-xl font-extralight">
            {formatToLocalTime(dt, timezone)}
          </p>
        </div>

        <div className="flex items-center justify-center my-3">
          <p className="text-white text-3xl font-medium">{`${name}, ${country}`}</p>
        </div>

        <div className="flex items-center justify-center py-6 text-xl text-cyan-300">
          <p>{details}</p>
        </div>

        <div className="flex flex-row items-center justify-between text-white py-3">
          <img src={iconUrlFromCode(icon)} alt="" className="w-20" />
          <p className="text-5xl">{`${temp.toFixed()}°`}</p>

          <div className="flex flex-col space-y-2">
            <div className="flex font-light text-sm items-center justify-center">
              <UilTemperature size={18} className="mr-1" />
              Feels like:
              <span className="font-medium ml-1">{`${feels_like.toFixed()}°`}</span>
            </div>

            <div className="flex font-light text-sm items-center justify-center">
              <UilTear size={18} className="mr-1" />
              Humidity:
              <span className="font-medium ml-1">{`${humidity.toFixed()}%`}</span>
            </div>

            <div className="flex font-light text-sm items-center justify-center">
              <UilWind size={18} className="mr-1" />
              Wind:
              <span className="font-medium ml-1">{`${speed.toFixed()} km/h`}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center justify-center space-x-2 text-white text-sm py-3">
          <UilSun />
          <p className="font-light">
            Rise:{" "}
            <span className="font-medium ml-1">
              {formatToLocalTime(sunrise, timezone, "hh:mm a")}
            </span>
          </p>
          <p className="font-light">|</p>

          <UilSunset />
          <p className="font-light">
            Set:{" "}
            <span className="font-medium ml-1">
              {formatToLocalTime(sunset, timezone, "hh:mm a")}
            </span>
          </p>
          <p className="font-light">|</p>

          <UilSun />
          <p className="font-light">
            High:{" "}
            <span className="font-medium ml-1">{`${temp_max.toFixed()}°`}</span>
          </p>
          <p className="font-light">|</p>

          <UilSun />
          <p className="font-light">
            Low:{" "}
            <span className="font-medium ml-1">{`${temp_min.toFixed()}°`}</span>
          </p>
        </div>

        {/* Horizontal Rule for separation */}
        <hr className="my-6 border-t-2 border-cyan-500 w-3/4 mx-auto" />
      </div>
    );
  };

  const isSingleCity = weatherData.hasOwnProperty("lat");

  return (
    <div
      className={`mx-auto max-w-screen-lg mt-4 py-5 px-16 bg-gradient-to-br h-fit  shadow-gray-400 ${formatBackground(
        weatherData
      )}`}
    >
      <TopButtons setQuery={setQuery} />
      <Inputs setQuery={setQuery} units={units} setUnits={setUnits} />
      {isSingleCity
        ? renderCityWeather(weatherData.name, weatherData)
        : Object.keys(weatherData).map((city) =>
            renderCityWeather(city, weatherData[city])
          )}

      <Summary weatherData={weatherData} units={units} />
      <Charts units={units} />
    </div>
  );
};

export default Details;
