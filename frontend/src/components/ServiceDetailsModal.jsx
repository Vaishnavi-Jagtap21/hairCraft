import { useNavigate } from "react-router-dom";

const ServiceDetailsModal = ({ service, onClose }) => {
  const navigate = useNavigate();

  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 flex gap-6 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl"
        >
          ✕
        </button>

        {/* Image */}
        <img
          src={service.imageUrl}
          alt={service.title}
          className="w-1/2 h-64 object-cover rounded-xl"
        />

        {/* Info */}
        <div className="flex-1 space-y-3">
          <h2 className="text-xl font-bold">
            {service.title}
          </h2>

          <p className="text-gray-600 text-sm">
            {service.description}
          </p>

          <p className="text-lg font-semibold">
            ₹{service.price}
          </p>

          {service.duration && (
            <p className="text-sm text-gray-500">
              ⏱ {service.duration} mins
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded-lg"
              onClick={() =>
                navigate("/Booking", { state: { services: [service] } })
              }
            >
              Buy Now
            </button>

            <button className="border px-4 py-2 rounded-lg">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
