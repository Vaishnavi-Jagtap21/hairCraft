import { createContext, useContext, useState } from "react";

// 1️⃣ Create Context
const StoreContext = createContext(null);

// 2️⃣ Provider Component
const StoreProvider = ({ children }) => {
  // 🔹 Admin Sidebar Active Tab
  // 1: Overview
  // 2: Services
  // 3: Appointments
  // 4: History
  // 5: Users
  const [openTabId, setOpenTabId] = useState(1);

  return (
    <StoreContext.Provider
      value={{
        openTabId,
        setOpenTabId,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// 3️⃣ Custom Hook (SAFE USAGE)
const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return context;
};

export { StoreProvider, useStore };
