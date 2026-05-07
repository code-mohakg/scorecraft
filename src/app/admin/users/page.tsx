'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { UserRole, User } from '@/types';
import { userStorage } from '@/lib/storage';
import { generateId, getCurrentTimestamp, validateEmail } from '@/utils/helpers';

export default function AdminUsersPage() {
  const { currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.STUDENT,
    gradeIds: [] as string[],
    subjectIds: [] as string[],
  });
  const [error, setError] = useState('');

  const { grades, subjects, getGrades, getSubjects } = useMasterDataStore();

  useEffect(() => {
    loadUsers();
    getGrades();
    getSubjects();
  }, []);

  const loadUsers = async () => {
    const allUsers = await userStorage.getAll();
    setUsers(allUsers);
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: UserRole.STUDENT,
      gradeIds: [],
      subjectIds: [],
    });
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError('Valid email is required');
      return false;
    }

    // Check if email already exists (excluding current user being edited)
    const existingUser = users.find(u =>
      u.email === formData.email &&
      (!editingUser || u.id !== editingUser.id)
    );
    if (existingUser) {
      setError('Email already exists');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    if (editingUser) {
      // Update existing user
      const updatedUser: User = {
        ...editingUser,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        gradeIds: formData.gradeIds,
        subjectIds: formData.subjectIds,
        updatedAt: getCurrentTimestamp(),
      };
      await userStorage.save(updatedUser);
    } else {
      // Create new user
      const newUser: User = {
        id: generateId(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        gradeIds: formData.gradeIds,
        subjectIds: formData.subjectIds,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };
      await userStorage.save(newUser);
    }

    loadUsers();
    setShowAddModal(false);
    setEditingUser(null);
    resetForm();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      gradeIds: user.gradeIds,
      subjectIds: user.subjectIds,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await userStorage.delete(userId);
      loadUsers();
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    resetForm();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.TEACHER:
        return 'bg-blue-100 text-blue-800';
      case UserRole.STUDENT:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole={UserRole.ADMIN}>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole={UserRole.ADMIN}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage teachers and students in the platform</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add New User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Teachers</h3>
            <p className="text-3xl font-bold text-blue-600">
              {users.filter(u => u.role === UserRole.TEACHER).length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Students</h3>
            <p className="text-3xl font-bold text-green-600">
              {users.filter(u => u.role === UserRole.STUDENT).length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-semibold text-primary-600">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found. Add your first user to get started.</p>
            </div>
          )}
        </div>

        {/* Add/Edit User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="form-label">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      className="form-input"
                    >
                      <option value={UserRole.STUDENT}>Student</option>
                      <option value={UserRole.TEACHER}>Teacher</option>
                      <option value={UserRole.ADMIN}>Administrator</option>
                    </select>
                  </div>

                  {/* Grade/Subject Assignment */}
                  {formData.role !== UserRole.ADMIN && (
                    <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="form-label text-xs uppercase text-gray-500">Assigned Grades</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {grades.map(g => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => {
                                const newIds = formData.gradeIds.includes(g.id)
                                  ? formData.gradeIds.filter(id => id !== g.id)
                                  : [...formData.gradeIds, g.id];
                                setFormData({ ...formData, gradeIds: newIds });
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                                formData.gradeIds.includes(g.id) ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-600'
                              }`}
                            >
                              {g.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {formData.gradeIds.length > 0 && (
                        <div>
                          <label className="form-label text-xs uppercase text-gray-500">Assigned Subjects</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {subjects.filter(s => formData.gradeIds.includes(s.gradeId)).map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  const newIds = formData.subjectIds.includes(s.id)
                                    ? formData.subjectIds.filter(id => id !== s.id)
                                    : [...formData.subjectIds, s.id];
                                  setFormData({ ...formData, subjectIds: newIds });
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                                  formData.subjectIds.includes(s.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-600'
                                }`}
                              >
                                {s.name} ({grades.find(g => g.id === s.gradeId)?.name})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-error">
                      {error}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex-1"
                    >
                      {editingUser ? 'Update User' : 'Add User'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
