import React, { useState } from "react";

const Profile: React.FC = () => {
  const [name, setName] = useState("John Doe");
  const [studentId, setStudentId] = useState("2023001");
  const [email, setEmail] = useState("john.doe@school.com");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address!");
      return;
    }
    setError("Profile updated successfully!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h1>
      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700">Student ID</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save Changes
          </button>
          {error && <p className={error.includes("success") ? "text-green-500" : "text-red-500"}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Profile;