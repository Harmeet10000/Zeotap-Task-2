import { DateTime } from "luxon";

const API_KEY = import.meta.env.VITE_APP_API_KEY;
const BASE_URL = import.meta.env.VITE_APP_API_URL;

// console.log("API_KEY", API_KEY, "BASE_URL", BASE_URL);

const getWeatherData = (infoType, searchParams) => {
  console.log("API_KEY", API_KEY, "BASE_URL", BASE_URL);
  const url = new URL(BASE_URL + "/" + infoType);
  url.search = new URLSearchParams({ ...searchParams, appid: API_KEY });
  console.log("Request URL:", url.toString());

  return fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Error fetching data: ${res.statusText}`);
      }
      // console.log("Request URL:", url.toString());

      return res.json();
    })
    .catch((error) => {
      console.error("Error:", error);
      throw error;
    });
};

const formatCurrentWeather = (data) => {
  // console.log("data", data);
  const {
    coord: { lat, lon },
    main: { temp, feels_like, temp_min, temp_max, humidity },
    name,
    dt,
    sys: { country, sunrise, sunset },
    weather,
    wind: { speed },
    timezone
  } = data;

  const { main: details, icon } = weather?.[0] || {};

  return {
    lat,
    lon,
    temp,
    feels_like,
    temp_min,
    temp_max,
    humidity,
    name,
    dt,
    country,
    sunrise,
    sunset,
    details,
    icon,
    speed,
    timezone
  };
};

// const formatForecastWeather = (data) => {
//   let { timezone, daily, hourly } = data;

//   daily = daily.slice(1, 6).map(({ dt, temp, weather }) => ({
//     title: formatToLocalTime(dt, timezone, "ccc"),
//     temp: temp.day,
//     icon: weather[0].icon,
//   }));

//   hourly = hourly.slice(1, 6).map(({ dt, temp, weather }) => ({
//     title: formatToLocalTime(dt, timezone, "hh:mm a"),
//     temp,
//     icon: weather[0].icon,
//   }));

//   return { timezone, daily, hourly };
// };

const getFormattedWeatherData = async (searchParams) => {
  console.log("searchParams", searchParams);
  const formattedCurrentWeather = await getWeatherData(
    "weather",
    searchParams
  ).then(formatCurrentWeather);

  // const { lat, lon } = formattedCurrentWeather;

  // const formattedForecastWeather = await getWeatherData("onecall", {
  //   lat,
  //   lon,
  //   exclude: "current,minutely,alerts",
  //   units: searchParams.units,
  // }).then(formatForecastWeather);

  return { ...formattedCurrentWeather };
};

const formatToLocalTime = (
  secs, // Unix timestamp in seconds
  offset, // Timezone offset in seconds (e.g., 19800 for IST)
  format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a"
) => {
  // Convert the offset (in seconds) to milliseconds for Luxon
  const offsetMillis = offset * 1000;

  // Use Luxon to convert the timestamp with the offset applied
  const dateTime = DateTime.fromSeconds(secs, { zone: "utc" }).plus({
    milliseconds: offsetMillis,
  }); // Apply offset

  return dateTime.toFormat(format);
};

const iconUrlFromCode = (code) =>
  `https://openweathermap.org/img/wn/${code}@2x.png`;

export default getFormattedWeatherData;
export { formatToLocalTime, iconUrlFromCode };
