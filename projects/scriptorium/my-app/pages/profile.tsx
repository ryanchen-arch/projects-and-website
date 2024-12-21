import { useState, useEffect } from "react";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture: string | null;
}

export default function ProfileForm() {
  const [form, setForm] = useState<User | {}>({});
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarOptions] = useState<string[]>([
    "/images/avatar1.jpg",
    "/images/avatar2.jpg",
    "/images/avatar3.jpg",
    "/images/avatar4.jpg",
  ]);

  // Fetch user details from localStorage or backend
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setForm(user);
      setSelectedAvatar(user.profilePicture); // Set the default avatar if available
    }
  }, []);

  // Handle the avatar selection
  const handleAvatarSelect = (avatar: string): void => {
    setSelectedAvatar(avatar);
  };

  // Save the selected avatar to the backend
  const handleAvatarSave = async (): Promise<void> => {
    if (!selectedAvatar) {
      alert("Please select an avatar!");
      return;
    }
  
    try {
      const response = await fetch("/api/update-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ avatar: selectedAvatar }),
      });
  
      if (response.ok) {
        const data = await response.json();
        const updatedAvatar = data.profilePicture;
        setSelectedAvatar(updatedAvatar); // Update the state with the new avatar URL
        setForm((prevForm) => ({
          ...prevForm,
          profilePicture: updatedAvatar,
        }));
        localStorage.setItem("user", JSON.stringify({ ...form, profilePicture: updatedAvatar }));
        alert("Avatar saved successfully!");
      } else {
        alert("Failed to save avatar");
      }
    } catch (error) {
      console.error("Error saving avatar:", error);
      alert("An error occurred while saving the avatar.");
    }
  };

  // Handle changes in the profile form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/updateProfile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        // Update localStorage with the new profile data
        localStorage.setItem("user", JSON.stringify({ ...form, ...updatedUser }));
        alert("Profile updated!");
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Profile</h1>

      {/* Avatar Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Your Avatar</h2>
        {/* Render the selected avatar */}
        <div className="flex justify-center my-4">
          {selectedAvatar ? (
            <img
              src={selectedAvatar}
              alt="Selected Avatar"
              className="w-32 h-32 rounded-full border border-gray-300"
            />
          ) : (
            <p>No avatar selected</p>
          )}
        </div>

        {/* Avatar selection */}
        <div className="flex justify-center space-x-6 overflow-x-auto">
          {avatarOptions.map((avatar, index) => (
            <div
              key={index}
              onClick={() => handleAvatarSelect(avatar)}
              className="cursor-pointer"
            >
              <img
                src={avatar}
                alt={`Avatar ${index + 1}`}
                className={`w-16 h-16 rounded-full border-2 transition-transform duration-200 ${
                  selectedAvatar === avatar
                    ? "border-blue-500 scale-110"
                    : "border-transparent"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Avatar Button */}
      <div className="text-center mb-8">
        <button
          onClick={handleAvatarSave}
          className="bg-blue-500 text-white p-2 rounded-lg"
        >
          Save Avatar
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={(form as User).firstName || ""}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={(form as User).lastName || ""}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={(form as User).email || ""}
          onChange={handleChange}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={(form as User).phoneNumber || ""}
          onChange={handleChange}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-md w-full hover:bg-blue-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
