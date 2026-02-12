import React from "react";

const highlights = [
  {
    title: "Certified Experts",
    subtitle: "Trained & experienced professionals",
    gradient: "from-pink-600 to-rose-500",
    icon: "✂️",
  },
  {
    title: "Premium Products",
    subtitle: "Top-quality salon brands",
    gradient: "from-purple-600 to-indigo-500",
    icon: "💎",
  },
  {
    title: "Easy Booking",
    subtitle: "Book appointments in seconds",
    gradient: "from-emerald-500 to-teal-500",
    icon: "📅",
  },
  {
    title: "Trusted by 1000+",
    subtitle: "Loved by happy customers",
    gradient: "from-amber-400 to-orange-500",
    icon: "⭐",
  },
];

const Footer = () => {
  return (
    <>
      {/* WHY CHOOSE */}
      <section className="py-20 bg-white">
        <h2 className="text-center text-3xl font-serif font-bold  mb-14">
          Why Choose <span className="text-rose-500">HairCraft</span>
        </h2>

        <div className="max-w-7xl mx-auto grid gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, i) => (
            <div
              key={i}
              className={`rounded-3xl p-8 text-white bg-gradient-to-br ${item.gradient}
              shadow-lg hover:-translate-y-2 transition duration-300`}
            >
              <div className="text-4xl mb-6">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>     
<footer className="bg-gray-100 px-10 py-14">
  <div className="max-w-7xl mx-auto grid gap-10 sm:grid-cols-2 md:grid-cols-4">

    {/* ABOUT */}
    <div>
      <h6 className="text-lg font-semibold mb-4">HairCraft</h6>
      <p className="text-sm text-gray-600 leading-relaxed">
        HairCraft is a modern women’s salon booking platform offering
        professional hair, beauty, and grooming services with certified
        experts and premium products.
      </p>

      {/* Social Icons */}
      <div className="flex gap-4 mt-4 text-lg">
        <span className="cursor-pointer hover:text-rose-500">📷</span>
        <span className="cursor-pointer hover:text-rose-500">👍</span>
        <span className="cursor-pointer hover:text-rose-500">💬</span>
      </div>
    </div>

    {/* Services */}
    <nav>
      <h6 className="text-lg font-semibold mb-4">Services</h6>
      <ul className="space-y-2 text-sm">
        <li className="hover:text-rose-500 cursor-pointer">Hair Styling</li>
        <li className="hover:text-rose-500 cursor-pointer">Bridal Makeup</li>
        <li className="hover:text-rose-500 cursor-pointer">Hair Coloring</li>
        <li className="hover:text-rose-500 cursor-pointer">Spa & Care</li>
        <li className="hover:text-rose-500 cursor-pointer">Facial & Cleanup</li>
      </ul>
    </nav>

    {/* Company */}
    <nav>
      <h6 className="text-lg font-semibold mb-4">Company</h6>
      <ul className="space-y-2 text-sm">
        <li className="hover:text-rose-500 cursor-pointer">About Us</li>
        <li className="hover:text-rose-500 cursor-pointer">Contact</li>
        <li className="hover:text-rose-500 cursor-pointer">Careers</li>
        <li className="hover:text-rose-500 cursor-pointer">Press</li>
      </ul>
    </nav>

    {/* Contact */}
    <div>
      <h6 className="text-lg font-semibold mb-4">Contact</h6>
      <ul className="space-y-2 text-sm text-gray-600">
        <li>📍 Pune, Maharashtra</li>
        <li>📞 +91 9922071167</li>
        <li>📧 vmjagtap2004.com</li>
        <li>⏰ Mon – Sun: 10AM – 8PM</li>
      </ul>
    </div>

  </div>
</footer>


      {/* BOTTOM BAR */}
      <div className="bg-gray-800/10 py-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} HairCraft. All rights reserved.
      </div>
    </>
  );
};

export default Footer;
