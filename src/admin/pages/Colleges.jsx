// pages/admin/Colleges.jsx
import { useEffect, useState } from "react";
import { getCollegesAPI } from "../services/adminService";
import { Plus, Edit, Trash2 } from "lucide-react";

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [formData, setFormData] = useState({ name: "", city: "Pune" });

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const { data } = await getCollegesAPI();
      setColleges(data);
    } catch (error) {
      console.error("Failed to fetch colleges:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCollege) {
        // Update college
        // await updateCollegeAPI(editingCollege._id, formData);
      } else {
        // Add college
        // await addCollegeAPI(formData);
      }
      fetchColleges();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save college:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this college?")) {
      try {
        // await deleteCollegeAPI(id);
        fetchColleges();
      } catch (error) {
        console.error("Failed to delete college:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", city: "Pune" });
    setEditingCollege(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Colleges 🏫</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} /> Add College
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3 text-left">College Name</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((college) => (
              <tr key={college._id} className="border-t border-gray-700">
                <td className="p-3">{college.name}</td>
                <td className="p-3">{college.city}</td>
                <td className="p-3">
                  <button
                    onClick={() => {
                      setEditingCollege(college);
                      setFormData(college);
                      setShowModal(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 mr-3"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(college._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingCollege ? "Edit College" : "Add New College"}
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="College Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mb-4 p-3 bg-gray-700 rounded"
                required
              />
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full mb-4 p-3 bg-gray-700 rounded"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-pink-600 hover:bg-pink-700 py-2 rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Colleges;