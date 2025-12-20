"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  plan: "free" | "pro" | "enterprise";
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

interface UserWithProgress extends User {
  coursesCompleted: number;
}

export default function UsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "pro" | "enterprise">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserWithProgress | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<{ plan: string; role: string }>({ plan: "free", role: "user" });
  const [stats, setStats] = useState({
    total: 0,
    pro: 0,
    enterprise: 0,
    mrr: 0
  });

  const usersPerPage = 10;

  // Load users from Supabase
  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const from = (page - 1) * usersPerPage;
      const to = from + usersPerPage - 1;

      // Fetch users with pagination
      const { data: profilesData, error: profilesError, count } = await (supabase as any)
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (profilesError) throw profilesError;

      // Fetch user progress for each user
      const usersWithProgress: UserWithProgress[] = await Promise.all(
        (profilesData || []).map(async (profile: User) => {
          await (supabase as any)
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', profile.id)
            .eq('completed', true);

          // Count unique courses completed
          const { data: completedLessons } = await (supabase as any)
            .from('user_progress')
            .select('course_id')
            .eq('user_id', profile.id)
            .eq('completed', true);

          const uniqueCourses = new Set(completedLessons?.map((l: any) => l.course_id) || []);

          return {
            ...profile,
            coursesCompleted: uniqueCourses.size
          };
        })
      );

      setUsers(usersWithProgress);
      setFilteredUsers(usersWithProgress);
      setTotalUsers(count || 0);

      // Calculate stats
      const proCount = profilesData?.filter((u: User) => u.plan === 'pro').length || 0;
      const enterpriseCount = profilesData?.filter((u: User) => u.plan === 'enterprise').length || 0;
      const mrr = (proCount * 29) + (enterpriseCount * 99); // Assuming $29/mo for pro, $99/mo for enterprise

      setStats({
        total: count || 0,
        pro: proCount,
        enterprise: enterpriseCount,
        mrr
      });
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and plan filter
  useEffect(() => {
    let filtered = users;

    if (search) {
      filtered = filtered.filter(user => {
        const name = user.full_name || '';
        return name.toLowerCase().includes(search.toLowerCase()) ||
               user.email.toLowerCase().includes(search.toLowerCase());
      });
    }

    if (planFilter !== "all") {
      filtered = filtered.filter(user => user.plan === planFilter);
    }

    setFilteredUsers(filtered);
  }, [search, planFilter, users]);

  // Load users on mount and when page changes
  useEffect(() => {
    loadUsers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Handle view user
  const handleViewUser = (user: UserWithProgress) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Handle edit user
  const handleEditUser = (user: UserWithProgress) => {
    setSelectedUser(user);
    setEditForm({ plan: user.plan, role: user.role });
    setShowEditModal(true);
  };

  // Save user changes
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          plan: editForm.plan,
          role: editForm.role
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Reload users
      await loadUsers(currentPage);
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      // Fetch all users for export
      const { data: allUsers, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Create CSV content
      const headers = ['ID', 'Email', 'Full Name', 'Plan', 'Role', 'Created At'];
      const csvRows = [headers.join(',')];

      allUsers?.forEach((user: User) => {
        const row = [
          user.id,
          user.email,
          user.full_name || '',
          user.plan,
          user.role,
          new Date(user.created_at).toISOString()
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Users</h2>
          <p className="text-gray-500">Manage your user base and subscriptions.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={loading}
          className="bg-cyan-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: loading ? "..." : stats.total.toLocaleString(), change: "" },
          { label: "Pro Subscribers", value: loading ? "..." : stats.pro.toLocaleString(), change: stats.total > 0 ? `${Math.round((stats.pro / stats.total) * 100)}% of users` : "" },
          { label: "Enterprise", value: loading ? "..." : stats.enterprise.toLocaleString(), change: stats.total > 0 ? `${Math.round((stats.enterprise / stats.total) * 100)}% of users` : "" },
          { label: "MRR", value: loading ? "..." : `$${stats.mrr.toLocaleString()}`, change: "" },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
            {stat.change && <div className="text-cyan-400 text-xs mt-1">{stat.change}</div>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
        />
        <div className="flex gap-2">
          {(["all", "free", "pro", "enterprise"] as const).map((plan) => (
            <button
              key={plan}
              onClick={() => setPlanFilter(plan)}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                planFilter === plan
                  ? "bg-cyan-500 text-black font-semibold"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {plan}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Loading users...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">No users found</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">User</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Plan</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Role</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Courses</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Signup Date</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Last Updated</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-semibold">
                        {user.full_name ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.full_name || "No name"}</div>
                        <div className="text-gray-500 text-sm">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.plan === "enterprise"
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : user.plan === "pro"
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">{user.coursesCompleted}</td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4 text-gray-400">{timeAgo(user.updated_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition text-sm"
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition text-sm"
                        title="Edit User"
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-sm">
          Showing {filteredUsers.length} of {totalUsers} users (Page {currentPage} of {totalPages || 1})
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || loading || totalPages === 0}
            className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowViewModal(false)}>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">ID</label>
                <div className="text-white font-mono text-sm bg-gray-800 p-2 rounded">{selectedUser.id}</div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Email</label>
                <div className="text-white">{selectedUser.email}</div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Full Name</label>
                <div className="text-white">{selectedUser.full_name || "Not set"}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Plan</label>
                  <div className="text-white capitalize">{selectedUser.plan}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Role</label>
                  <div className="text-white capitalize">{selectedUser.role}</div>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Courses Completed</label>
                <div className="text-white">{selectedUser.coursesCompleted}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Created At</label>
                  <div className="text-white text-sm">{formatDate(selectedUser.created_at)}</div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Last Updated</label>
                  <div className="text-white text-sm">{formatDate(selectedUser.updated_at)}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditUser(selectedUser);
                }}
                className="flex-1 bg-cyan-500 text-black py-3 rounded-lg font-semibold hover:bg-cyan-400 transition"
              >
                Edit User
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Email</label>
                <div className="text-white bg-gray-800 p-3 rounded">{selectedUser.email}</div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Plan</label>
                <select
                  value={editForm.plan}
                  onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 bg-cyan-500 text-black py-3 rounded-lg font-semibold hover:bg-cyan-400 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
