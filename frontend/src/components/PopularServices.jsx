import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;
const categories = ["All", "Hair", "Makeup", "Color", "Spa", "Facial", "Nails", "Grooming"];

const PopularServices = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [activeCat, setActiveCat] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ✅ MULTI SERVICE CART */
  const [cartServices, setCartServices] = useState([]);

  /* ================= LOAD SERVICES ================= */
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${SERVER_URL}/api/services`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
        setError("");
      } catch {
        setError("Unable to load services");
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  /* ================= FILTER ================= */
  const filteredServices =
    activeCat === "All"
      ? services
      : services.filter((s) => s.category === activeCat);

  /* ================= CART FUNCTIONS ================= */
  const addToCart = (service) => {
    const exists = cartServices.find((s) => s.id === service.id);

    if (!exists) {
      setCartServices((prev) => [...prev, service]);
    }
  };

  const removeFromCart = (id) => {
    setCartServices((prev) =>
      prev.filter((s) => s.id !== id)
    );
  };

  const totalAmount = cartServices.reduce(
    (sum, s) => sum + Number(s.price || 0),
    0
  );

  return (
    <>
      <Navbar />

      <section className="pt-28 pb-20 bg-[#fffaf4]">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl mb-2 font-serif font-bold">Popular Services</h2>
          <p className="text-gray-600">
            Discover beauty crafted just for you
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-14 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-6 py-2 rounded-full transition ${activeCat === cat
                ? "bg-black text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-500">
            Loading services...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {/* Services */}
        {!loading && !error && (
          <div className="max-w-7xl mx-auto grid gap-10 px-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredServices.map((service) => {
              const added = cartServices.find(
                (s) => s.id === service.id
              );

              return (
                <div
                  key={service.id}
                  className="group relative rounded-3xl overflow-hidden bg-black shadow-xl"
                >
                  <img
                    src={
                      service.image ||
                      "https://via.placeholder.com/400"
                    }
                    alt={service.name}
                    className="h-[420px] w-full object-cover group-hover:scale-105 transition"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {service.badge && (
                    <span className="absolute top-4 left-4 bg-white text-black text-xs px-3 py-1 rounded-full">
                      {service.badge}
                    </span>
                  )}

                  <div className="absolute bottom-0 p-6 text-white">
                    <h3 className="text-2xl font-semibold">
                      {service.name}
                    </h3>

                    <p className="text-sm text-gray-300 mb-4">
                      Starting at ₹{service.price}
                    </p>

                    <button
                      onClick={() => addToCart(service)}
                      className={`px-6 py-2 rounded-full text-white transition ${added
                        ? "bg-green-600"
                        : "bg-black hover:bg-gray-800"
                        }`}
                    >
                      {added ? "Added ✓" : "Add +"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ✅ FLOATING BOOKING CART */}
        {cartServices.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-4 rounded-full shadow-xl flex items-center gap-6 z-50">
            <div>
              <p className="text-sm">
                {cartServices.length} services selected
              </p>
              <p className="font-semibold">₹{totalAmount}</p>
            </div>

            <button
              onClick={() =>
                navigate("/booking", {
                  state: { services: cartServices },
                })
              }
              className="bg-white text-black px-5 py-2 rounded-full font-medium"
            >
              Continue →
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default PopularServices;
