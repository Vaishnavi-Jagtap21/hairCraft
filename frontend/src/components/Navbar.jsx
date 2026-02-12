import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setOpen(false);
    navigate("/login");
  };

  // ✅ ImageKit-ready profile image
  const profileImage = user?.image || null;

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-white/70">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

          {/* LOGO */}
          <h1
            className="text-3xl md:text-4xl font-serif font-normal cursor-pointer stylish-font "
            onClick={() => navigate("/")}
          >
            HairCraft
          </h1>

          {/* DESKTOP MENU */}
          <ul className="hidden md:flex items-center gap-8 text-lg ">
            <li><Link to="/">Home</Link></li>
            {/* <li><Link to="/booking">Booking</Link></li> */}
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/offers">Offers</Link></li>

            {!user ? (
              <li>
                <Link to="/login" className="font-semibold">
                  Login
                </Link>
              </li>
            ) : (
              <li>
                <button
                  onClick={() => navigate("/profile")}
                  title="My Profile"
                  className="focus:outline-none"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border hover:ring-2 hover:ring-black transition"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              </li>
            )}
          </ul>

          {/* HAMBURGER */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-2xl"
          >
            <i className="ri-menu-3-line"></i>
          </button>
        </div>
      </nav>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-[75%] max-w-sm bg-white z-50
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-2xl font-serif font-bold">HairCraft</h2>
          <button onClick={() => setOpen(false)} className="text-2xl">
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* PROFILE (MOBILE) */}
        {user && (
          <div
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className="flex justify-center py-6 cursor-pointer"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        <ul className="flex flex-col gap-6 px-6 py-4 text-lg">
          <li><Link to="/" onClick={() => setOpen(false)}>Home</Link></li>
          <li><Link to="/booking" onClick={() => setOpen(false)}>Booking</Link></li>
          <li><Link to="/contact" onClick={() => setOpen(false)}>Contact Us</Link></li>
          <li><Link to="/offers" onClick={() => setOpen(false)}>Offers</Link></li>

          {user && (
            <li>
              <button
                onClick={handleLogout}
                className="text-500 font-semibold"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </>
  );
};

export default Navbar;
