import { useState, useEffect } from "react";
import { Users, Search } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import adminService from "../../api/adminService";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold mb-2">All Users 👥</h1>
          <p className="text-dark-muted">Manage platform users</p>
        </div>

        <div className="card">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted"
              size={20}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="card">
          <p className="mb-4">
            Total Users: <strong>{filteredUsers.length}</strong>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.user_id}
                    className="border-b border-dark-border hover:bg-dark-hover"
                  >
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3 text-dark-muted">{user.email}</td>
                    <td className="p-3 text-dark-muted">{user.phone}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.user_type === "admin"
                            ? "bg-red-500/10 text-red-500"
                            : user.user_type === "provider"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-green-500/10 text-green-500"
                        }`}
                      >
                        {user.user_type}
                      </span>
                    </td>
                    <td className="p-3 text-dark-muted">{user.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
