export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-primary border-t-blue-600"></div>
        <p className="text-sm font-medium text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}