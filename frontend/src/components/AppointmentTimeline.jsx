import React from "react";

const steps = [
  "BOOKED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
];

const AppointmentTimeline = ({ status }) => {

  const currentIndex = steps.indexOf(status);

  return (
    <div className="flex items-center justify-between mt-4">

      {steps.map((step, index) => (
        <div key={step} className="flex-1 text-center">

          <div
            className={`w-4 h-4 mx-auto rounded-full ${
              index <= currentIndex
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
          />

          <p className="text-xs mt-1">{step.replace("_", " ")}</p>

          {index !== steps.length - 1 && (
            <div
              className={`h-1 ${
                index < currentIndex
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default AppointmentTimeline;
