import { useEffect, useState } from "react";
import {
  getUsersAPI,
  approveUserAPI,
  rejectUserAPI,
  banUserAPI,
} from "../services/adminService";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await getUsersAPI();
      setUsers(data.users);
    } catch (err) {
      console.log(err);
    }
  };

  const handleApprove = async (id) => {
    await approveUserAPI(id);
    fetchUsers();
  };

  const handleReject = async (id) => {
    await rejectUserAPI(id);
    fetchUsers();
  };

  const handleBan = async (id) => {
    await banUserAPI(id);
    fetchUsers();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users 👥</h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-gray-800 rounded-xl overflow-hidden">
          <thead className="bg-gray-700 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-t border-gray-700"
              >
                <td className="p-3">{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.gender}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      user.status === "active"
                        ? "bg-green-600"
                        : user.status === "pending"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="space-x-2">
                  {user.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(user._id)}
                        className="bg-green-600 px-3 py-1 rounded text-sm"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(user._id)}
                        className="bg-yellow-600 px-3 py-1 rounded text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {user.status === "active" && (
                    <button
                      onClick={() => handleBan(user._id)}
                      className="bg-red-600 px-3 py-1 rounded text-sm"
                    >
                      Ban
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
