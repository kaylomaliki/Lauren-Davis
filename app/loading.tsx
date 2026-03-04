export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

