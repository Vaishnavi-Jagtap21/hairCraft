export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  );
}
