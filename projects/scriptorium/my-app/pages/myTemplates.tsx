// pages/templates.tsx

import { useState, useEffect } from "react";
import { useRouter } from 'next/router';

interface Template {
  id: number;
  title: string;
  explanation: string;
  tags: string;
  code: string;
}

export default function MyTemplates() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null); // Track the user ID
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedInUserId = localStorage.getItem("userId");

    if (token && loggedInUserId) {
      setIsLoggedIn(true);
      setUserId(Number(loggedInUserId));
    } else {
      setIsLoggedIn(false);
      router.push("/login"); // Redirect to login if not logged in
    }
  }, []);

  const fetchUserTemplates = async (page = 1) => {
    try {
      const res = await fetch(`/api/templates/search?search=${userId}&page=${page}&limit=10`);
      const tempData = await res.json();
      setTemplates(tempData.data);
      setTotalPages(Math.ceil(tempData.totalCount / 10));
    } catch (error) {
      console.error("Error fetching user templates:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchUserTemplates(currentPage);
    }
  }, [isLoggedIn, userId, currentPage]);
  
  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 py-4 px-6">Your Code Templates</h1>
        <div className="px-4 py-8 max-w-6xl mx-auto">
            <div className="space-y-6">
            {templates.length === 0 ? (
                <p className="text-xl font-semibold text-gray-900">You have no templates yet.</p>
            ) : (
                templates.map((template) => (
                <div key={template.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-semibold text-gray-900">{template.title}</h3>
                    <p className="text-gray-700">{template.explanation}</p>
                    <p className="text-gray-700">{template.tags}</p>
                    <p className="text-gray-700">{template.code}</p>
                </div>
                ))
            )}
            </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-lg">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
    
  );
};

