// pages/admin/Colleges.jsx - Enhanced UI & Fully Responsive
import { useEffect, useState } from "react";
import { 
  getCollegesAPI,
  addCollegeAPI,
  updateCollegeAPI,
  deleteCollegeAPI 
} from "../services/adminService";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  X,
  Check,
  Building2,
  MapPin,
  GraduationCap,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Download,
  RefreshCw,
  Sparkles,
  School
} from "lucide-react";

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [formData, setFormData] = useState({ name: "", city: "Pune" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const { data } = await getCollegesAPI();
      setColleges(data);
    } catch (error) {
      console.error("Failed to fetch colleges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCollege) {
        await updateCollegeAPI(editingCollege._id, formData);
      } else {
        await addCollegeAPI(formData);
      }
      await fetchColleges();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save college:", error);
      alert(error.response?.data?.message || "Failed to save college");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCollege) return;
    try {
      await deleteCollegeAPI(selectedCollege._id);
      await fetchColleges();
      setShowDeleteModal(false);
      setSelectedCollege(null);
    } catch (error) {
      console.error("Failed to delete college:", error);
      alert("Failed to delete college");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", city: "Pune" });
    setEditingCollege(null);
  };

  // Filter and sort colleges
  const filteredColleges = colleges
    .filter(college => {
      const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = filterCity === 'all' || college.city === filterCity;
      return matchesSearch && matchesCity;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc'
          ? a.city.localeCompare(b.city)
          : b.city.localeCompare(a.city);
      }
    });

  // Get unique cities for filter
  const cities = ['all', ...new Set(colleges.map(c => c.city))];

  // Delete Confirmation Modal
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-3xl p-8 max-w-sm w-full animate-popIn border border-gray-700">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center animate-pulse">
          <Trash2 size={36} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-center mb-3 text-white">Delete College?</h3>
        <p className="text-gray-400 text-center mb-6">
          Are you sure you want to delete <span className="font-semibold text-pink-500">{selectedCollege?.name}</span>? 
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 font-semibold hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Add/Edit Modal
  const CollegeModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-3xl p-8 max-w-md w-full animate-popIn border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {editingCollege ? "Edit College" : "Add New College"}
          </h2>
          <button
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
            className="p-2 hover:bg-gray-700 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              College Name
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="e.g., COEP Technological University"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-white placeholder-gray-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="e.g., Pune"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-white placeholder-gray-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} />
                  {editingCollege ? "Update" : "Save"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-xl font-semibold hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <School size={24} className="text-pink-500 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-400 animate-pulse">Loading colleges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Delete Modal */}
      {showDeleteModal && <DeleteModal />}

      {/* Add/Edit Modal */}
      {showModal && <CollegeModal />}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-lg shadow-pink-500/30">
            <Building2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Colleges
            </h1>
            <p className="text-gray-400 mt-1">Manage all Pune colleges</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add College
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Building2 size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Colleges</p>
              <p className="text-2xl font-bold text-white">{colleges.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <MapPin size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Cities</p>
              <p className="text-2xl font-bold text-white">{new Set(colleges.map(c => c.city)).size}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <GraduationCap size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pune Colleges</p>
              <p className="text-2xl font-bold text-white">
                {colleges.filter(c => c.city === 'Pune').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search colleges by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-white placeholder-gray-500"
          />
        </div>

        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-pink-500 text-white"
        >
          {cities.map(city => (
            <option key={city} value={city}>
              {city === 'all' ? 'All Cities' : city}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition flex items-center gap-2 text-white"
          >
            {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            Sort
          </button>

          <button
            onClick={fetchColleges}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition"
          >
            <RefreshCw size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Colleges Grid/Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        {filteredColleges.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-400 text-lg mb-2">No colleges found</p>
            <p className="text-gray-500 text-sm mb-6">Try adjusting your search or add a new college</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Add College
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => {
                        setSortBy('name');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-2 hover:text-white transition"
                    >
                      College Name
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => {
                        setSortBy('city');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-2 hover:text-white transition"
                    >
                      City
                      {sortBy === 'city' && (
                        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredColleges.map((college, index) => (
                  <tr 
                    key={college._id} 
                    className="hover:bg-gray-700/50 transition group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {college.name.charAt(0)}
                        </div>
                        <span className="text-white font-medium">{college.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs font-medium">
                        {college.city}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCollege(college);
                            setFormData(college);
                            setShowModal(true);
                          }}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition group"
                          title="Edit College"
                        >
                          <Edit size={16} className="text-blue-500" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCollege(college);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition group"
                          title="Delete College"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {filteredColleges.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
          <p>
            Showing <span className="text-white font-medium">{filteredColleges.length}</span> of{' '}
            <span className="text-white font-medium">{colleges.length}</span> colleges
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              Pune: {colleges.filter(c => c.city === 'Pune').length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Others: {colleges.filter(c => c.city !== 'Pune').length}
            </span>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-popIn {
          animation: popIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Colleges;