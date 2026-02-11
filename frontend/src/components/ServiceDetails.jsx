import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
const SERVER_URL = import.meta.env.VITE_JAVA_SERVER
const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/api/services/${id}`)
      .then((res) => setService(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!service) {
    return <p className="p-8">Loading service...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

      {/* Image */}
      <img
        src={service.imageUrl}
        alt={service.title}
        className="w-full h-96 object-cover rounded-2xl shadow"
      />

      {/* Info */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{service.title}</h1>

        <p className="text-gray-600">{service.description}</p>

        <p className="text-2xl font-semibold">₹{service.price}</p>

        {service.duration && (
          <p className="text-gray-500">
            ⏱ Duration: {service.duration} mins
          </p>
        )}

        <button
          onClick={() => navigate("/Booking", { state: { services: [service] } })}
          className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default ServiceDetails;
