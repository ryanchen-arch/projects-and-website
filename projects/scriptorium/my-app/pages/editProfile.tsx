import { useState, useEffect } from "react";
import { useRouter } from 'next/router';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
}
export default function MyProfile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [profile, setProfile] = useState<User>();
  const [successMessage, setSuccessMessage] = useState<string>('');
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

  // Function to handle the patch request
  const updateUserProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("Token is missing or expired.");
      return;
    }

    try {
      const res = await fetch("/api/users/edit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error updating user:", data.error || data.message);
      } else {
        setSuccessMessage('Profile updated successfully!');
        setProfile(data);
      }
    } catch (error) {
      console.error("Error with PATCH request:", error);
    }
  };

  // Fetch user profile on initial load
  useEffect(() => {
    if (isLoggedIn && userId) {
      const fetchUserProfile = async () => {
        const token = localStorage.getItem("token");

        try {
          const res = await fetch(`/api/users/edit?userId=${userId}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (res.ok) {
            setProfile(data);
            setFirstName(data.firstName);
            setLastName(data.lastName);
            setEmail(data.email);
            setPhoneNumber(data.phoneNumber || "");
          } else {
            console.error("Error fetching profile:", data.error || data.message);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };

      fetchUserProfile();
    }
  }, [isLoggedIn, userId]);

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 py-4 px-6">Update Profile</h1>
        <div className="px-4 py-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            {profile ? (
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                <h4 className="text-xl font-semibold text-gray-900 py-4">Profile Information</h4>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-white mt-1 p-2 border border-gray-300 rounded-md w-full text-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-white mt-1 p-2 border border-gray-300 rounded-md w-full text-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white mt-1 p-2 border border-gray-300 rounded-md w-full text-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-white mt-1 p-2 border border-gray-300 rounded-md w-full text-white"
                    />
                  </div>

                  <button
                    onClick={updateUserProfile}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                  >
                    Update Profile
                  </button>
                  {successMessage && (
                  <p className="mt-4 text-green-600 font-medium">{successMessage}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xl font-semibold text-gray-900">User does not exist.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
