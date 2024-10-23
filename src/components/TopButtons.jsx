import React from "react";

const TopButtons = ({ setQuery }) => {
  const cities = [
    {
      id: 1,
      title: "Delhi",
    },
    {
      id: 2,
      title: "Mumbai",
    },
    {
      id: 3,
      title: "Chennai",
    },
    {
      id: 4,
      title: "Bangalore",
    },
    {
      id: 5,
      title: "Kolkata",
    },
    {
      id: 6,
      title: "Hyderabad",
    },
  ];

  return (
    <div className="flex items-center justify-around my-6 gap-x-2">
      {cities.map((city) => (
        <button
          key={city.id}
          className="text-white text-lg font-medium "
          onClick={() => setQuery({ q: city.title })}
        >
          {city.title}
        </button>
      ))}
    </div>
  );
}

export default TopButtons;
