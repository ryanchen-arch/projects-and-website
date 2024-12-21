// pages/posts.tsx

import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Post {
  id: number;
  title: string;
  description: string;
  tags: string;
  author: {
    firstName: string;
    lastName: string;
  };
  rating: number;
}

export default function MyPosts() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null); // Track the user ID
  const [posts, setPosts] = useState<Post[]>([]);
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
  const fetchUserPosts = async (page = 1) => {
    try {
    /*
      const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            blogPosts: {
                include: {
                    author: true,  // Include the author relation
                },
            },
        },
      })
    */
      const res = await fetch(`/api/posts/search?page=${page}&limit=10&authorId=${userId}`);
      const data = await res.json();
      setPosts(data.data);
      setTotalPages(Math.ceil(data.totalCount / 10));
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchUserPosts(currentPage);
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
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 py-4 px-6">Your Blog Posts</h1>
        <div className="px-4 py-8 max-w-6xl mx-auto">
            <div className="space-y-6">
            {posts.length === 0 ? (
                <p className="text-xl font-semibold text-gray-900">You have no posts yet.</p>
            ) : (
                posts.map((post) => (
                <div key={post.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                    <h4 className="text-xl font-semibold text-gray-900">{post.title}</h4>
                    <p className="text-gray-700">{post.description}</p>
                    <p className="text-gray-700"><strong>Tags:</strong> {post.tags}</p>
                    <p className="text-gray-700"><strong>Author:</strong> {post.author.firstName} {post.author.lastName}</p>
                    <p className="text-gray-700"><strong>Rating:</strong> {post.rating}</p>
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
