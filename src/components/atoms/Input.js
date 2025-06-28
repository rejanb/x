export default function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <input
        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}
