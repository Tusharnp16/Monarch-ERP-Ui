const PageLoader = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-500 font-medium animate-pulse">
      Loading Monarch ERP...
    </p>
  </div>
);

export default PageLoader;
