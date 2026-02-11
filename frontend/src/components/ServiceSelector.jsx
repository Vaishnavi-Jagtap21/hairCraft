import React, { useEffect, useState } from "react";
const SERVER_URL = import.meta.env.VITE_JAVA_SERVER
const ServiceSelector = ({ selectedService, onSelect }) => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/services`)
      .then(res => res.json())
      .then(data => setServices(data));
  }, []);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {services.map(service => (
        <div
          key={service.id}
          onClick={() => onSelect(service)}
          className={`cursor-pointer rounded-2xl border p-6 ${
            selectedService?.id === service.id
              ? "border-black bg-black text-white"
              : "bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold mb-1">{service.name}</h3>
          <p className="text-sm opacity-80 mb-2">{service.description}</p>
          <p className="font-medium">{service.price}</p>
        </div>
      ))}
    </div>
  );
};

export default ServiceSelector;
