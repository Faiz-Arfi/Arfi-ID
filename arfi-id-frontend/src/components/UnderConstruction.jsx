import { ArrowLeft, Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UnderConstruction = ({ pageName = "This page" }) => {

    const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
        <div className="mb-6">
          <Construction className="w-20 h-20 mx-auto text-blue-500 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Under Construction
        </h1>
        <p className="text-gray-600 text-lg mb-4">
          {pageName} is currently being built.
        </p>
        <p className="text-gray-500 text-sm">
          Check back soon for updates!
        </p>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary mt-6 px-5 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 inline-block mr-2" />
          Go to back
        </button>
      </div>
    </div>
  );
};

export default UnderConstruction;
