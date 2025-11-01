import React, { useState, useEffect } from "react";
import axios from "axios";

const PrincipalManagement: React.FC = () => {
  const [principals, setPrincipals] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    fetchPrincipals();
  }, []);

  // 🔹 Fetch all principals (optional if backend GET is allowed)
  const fetchPrincipals = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/register/registration/?role=principal"
      );
      setPrincipals(res.data);
    } catch (error) {
      console.error("Error fetching principals:", error);
    }
  };

  // 🔹 Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Handle principal registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password match check
    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/register/registration/", {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: "principal",
      });

      alert("✅ Principal registered successfully!");
      setFormData({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
      });
      fetchPrincipals();
    } catch (error: any) {
      console.error("Error registering principal:", error.response?.data || error);
      alert("❌ Failed to register principal — check console for details.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Principal Management</h1>

      {/* Add Principal Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 mb-6 max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">Add New Principal</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="border p-2 mb-3 w-full rounded"
          required
        />

        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          className="border p-2 mb-3 w-full rounded"
          required
        />

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          className="border p-2 mb-3 w-full rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 mb-3 w-full rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Set Password"
          value={formData.password}
          onChange={handleChange}
          className="border p-2 mb-3 w-full rounded"
          required
        />

        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={formData.confirm_password}
          onChange={handleChange}
          className="border p-2 mb-4 w-full rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
        >
          Register Principal
        </button>
      </form>

      {/* List of Principals */}
      <h2 className="text-xl font-semibold mb-3">Registered Principals</h2>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4">Username</th>
              <th className="py-2 px-4">First Name</th>
              <th className="py-2 px-4">Last Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Role</th>
            </tr>
          </thead>
          <tbody>
            {principals.length > 0 ? (
              principals.map((principal, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 px-4">{principal.username}</td>
                  <td className="py-2 px-4">{principal.first_name}</td>
                  <td className="py-2 px-4">{principal.last_name}</td>
                  <td className="py-2 px-4">{principal.email}</td>
                  <td className="py-2 px-4">{principal.role}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-4 text-gray-500 italic"
                >
                  No principals registered yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrincipalManagement;