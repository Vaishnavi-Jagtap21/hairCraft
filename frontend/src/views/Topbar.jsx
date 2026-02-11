export default function Topbar() {
  return (
    <div className="bg-white px-8 py-4 shadow flex justify-between items-center">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">Admin</span>
        <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full">
          A
        </div>
      </div>
    </div>
  );
}
