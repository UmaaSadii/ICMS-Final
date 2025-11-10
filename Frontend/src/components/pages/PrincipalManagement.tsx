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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrincipals();
  }, []);

  const fetchPrincipals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://127.0.0.1:8000/api/register/registration/?role=principal"
      );
      setPrincipals(res.data);
    } catch (error) {
      console.error("Error fetching principals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      alert("⚠️ Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://127.0.0.1:8000/api/register/registration/", {
        ...formData,
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
      alert("❌ Registration failed. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 py-12 px-6 flex justify-center">
      <div className="w-full max-w-6xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-2xl rounded-3xl p-10 transition-all">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-800 drop-shadow-sm">
            🏛️ Principal Registeration
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and register institution principals with elegance.
          </p>
        </div>

        {/* Add Principal Form */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-inner rounded-2xl p-8 mb-10">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6 border-b-2 border-blue-300 pb-2">
            ➕ Register a New Principal
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[
              { name: "username", label: "Username", type: "text" },
              { name: "first_name", label: "First Name", type: "text" },
              { name: "last_name", label: "Last Name", type: "text" },
              { name: "email", label: "Email", type: "email" },
              { name: "password", label: "Password", type: "password" },
              { name: "confirm_password", label: "Confirm Password", type: "password" },
            ].map((input) => (
              <div key={input.name} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {input.label}
                </label>
                <input
                  type={input.type}
                  name={input.name}
                  value={(formData as any)[input.name]}
                  onChange={handleChange}
                  required
                  className="border border-blue-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                />
              </div>
            ))}

            <div className="col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`mt-2 px-8 py-2.5 font-semibold rounded-lg shadow-md transition-all duration-200 ${
                  loading
                    ? "bg-blue-300 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95"
                }`}
              >
                {loading ? "Processing..." : "Register Principal"}
              </button>
            </div>
          </form>
        </div>

        {/* Registered Principals Table */}
        <div className="bg-white border border-blue-100 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">📋 Registered Principals</h2>
            <span className="text-sm opacity-80">
              Total: {principals.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-blue-100">
                <tr>
                  {["Username", "First Name", "Last Name", "Email", "Role"].map(
                    (header) => (
                      <th
                        key={header}
                        className="py-3 px-4 text-sm font-semibold text-blue-800 border-b border-blue-200"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-blue-600 font-medium italic"
                    >
                      Loading data...
                    </td>
                  </tr>
                ) : principals.length > 0 ? (
                  principals.map((p, index) => (
                    <tr
                      key={index}
                      className={`transition-all duration-200 ${
                        index % 2 === 0 ? "bg-blue-50" : "bg-white"
                      } hover:bg-blue-100`}
                    >
                      <td className="py-3 px-4 border-b border-blue-100">
                        {p.username}
                      </td>
                      <td className="py-3 px-4 border-b border-blue-100">
                        {p.first_name}
                      </td>
                      <td className="py-3 px-4 border-b border-blue-100">
                        {p.last_name}
                      </td>
                      <td className="py-3 px-4 border-b border-blue-100">
                        {p.email}
                      </td>
                      <td className="py-3 px-4 border-b border-blue-100 capitalize">
                        {p.role}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-gray-500 italic"
                    >
                      No principals registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalManagement;
