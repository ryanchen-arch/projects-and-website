// pages/posts.tsx

import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
}

export default function MyProfile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [profile, setProfile] = useState<User>();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedInUserId = localStorage.getItem("userId");

    if (token && loggedInUserId) {
      setIsLoggedIn(true);
      setUserId(Number(loggedInUserId));
      console.log(userId);
    } else {
      setIsLoggedIn(false);
      router.push("/login"); // Redirect to login if not logged in
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && userId) {
      const fetchUserPosts = async () => {
        try {
          console.log("Fetching user with ID:", userId);
          const res = await fetch(`/api/users/edit?userId=${userId}`);
          const data = await res.json();
          setProfile(data.user);
          console.log(data.user);
        } catch (error) {
          console.error("Error fetching user posts:", error);
        }
      };

      fetchUserPosts();
    }
  }, [isLoggedIn, userId]);

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 py-4 px-6">Your Profile</h1>
        <div className="px-4 py-8 max-w-6xl mx-auto">
            <div className="space-y-6">
            {profile ? (
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                    <h4 className="text-xl font-semibold text-gray-900">{profile.id}</h4>
                    <p className="text-gray-700">{profile.firstName} {profile.lastName}</p>
                    <p className="text-gray-700"><strong>Email:</strong> {profile.email}</p>
                    {profile.phoneNumber && (
                        <p className="text-gray-700"><strong>Phone Number:</strong> {profile.phoneNumber}</p>
                    )}
                </div>
            ) : (
                <p className="text-xl font-semibold text-gray-900">User does not exist.</p>
            )}
            </div>
        </div>
        </div>
    </>

  );
};
