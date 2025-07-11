import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { FiEdit, FiTrash2, FiPlus, FiX, FiCheck, FiSearch, FiUser, FiShield, FiUsers, FiKey, FiLock } from 'react-icons/fi';
import Loading from './Loading';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role_id: ''
  });
  const [userPermissions, setUserPermissions] = useState({});

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
      fetchRoles();
      fetchPermissions();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      if (response.success && response.data) {
        setUsers(response.data.users);
      } else if (Array.isArray(response)) {
        setUsers(response);
      } else {
        console.error('Unexpected users response format:', response);
        toast.error('Failed to load users - unexpected response format');
      }
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiService.getRoles();
      if (response.success && response.data) {
        setRoles(response.data.roles);
      } else if (Array.isArray(response)) {
        setRoles(response);
      } else {
        console.error('Unexpected roles response format:', response);
        toast.error('Failed to load roles - unexpected response format');
      }
    } catch (error) {
      toast.error('Failed to load roles');
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await apiService.getPermissions();
      if (response.success && response.data) {
        setPermissions(response.data.permissions);
      } else if (Array.isArray(response)) {
        setPermissions(response);
      } else {
        console.log('No permissions found or API not implemented yet');
        // Set default permissions for demo
        setPermissions([
          { permission_id: 1, permission_name: 'view_dashboard', description: 'View dashboard' },
          { permission_id: 2, permission_name: 'view_sales', description: 'View sales data' },
          { permission_id: 3, permission_name: 'manage_users', description: 'Manage users' },
          { permission_id: 4, permission_name: 'manage_products', description: 'Manage products' },
          { permission_id: 5, permission_name: 'manage_inventory', description: 'Manage inventory' },
          { permission_id: 6, permission_name: 'view_reports', description: 'View reports' }
        ]);
      }
    } catch (error) {
      console.log('Permissions API not available, using defaults');
      // Set default permissions for demo
      setPermissions([
        { permission_id: 1, permission_name: 'view_dashboard', description: 'View dashboard' },
        { permission_id: 2, permission_name: 'view_sales', description: 'View sales data' },
        { permission_id: 3, permission_name: 'manage_users', description: 'Manage users' },
        { permission_id: 4, permission_name: 'manage_products', description: 'Manage products' },
        { permission_id: 5, permission_name: 'manage_inventory', description: 'Manage inventory' },
        { permission_id: 6, permission_name: 'view_reports', description: 'View reports' }
      ]);
    }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      const response = await apiService.getUserPermissions(userId);
      if (response.success && response.data) {
        return response.data.permissions || [];
      }
      return [];
    } catch (error) {
      console.log('User permissions API not available');
      return [];
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setFormData({
      username: '',
      password: '',
      role_id: ''
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setFormData({
      username: user.username,
      password: '',
      role_id: user.role_id
    });
    setShowModal(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setFormData({
      username: user.username,
      password: '',
      role_id: user.role_id
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === user.user_id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        const response = await apiService.deleteUser(userId);
        if (response.success) {
          toast.success(`User "${userName}" deleted successfully`);
          fetchUsers();
        } else {
          toast.error(response.message || 'Failed to delete user');
        }
      } catch (error) {
        if (error.message && error.message.includes('Database is not connected')) {
          toast.error('User deletion is not available in demo mode. Please connect to a database to delete users.');
        } else {
          toast.error(error.message || 'Failed to delete user');
        }
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        const response = await apiService.createUser(formData);
        if (response.success) {
          toast.success('User created successfully');
          setShowModal(false);
          fetchUsers();
        } else {
          toast.error(response.message || 'Failed to create user');
        }
      } else if (modalMode === 'edit') {
        const response = await apiService.updateUser(selectedUser.user_id, formData);
        if (response.success) {
          toast.success('User updated successfully');
          setShowModal(false);
          fetchUsers();
        } else {
          toast.error(response.message || 'Failed to update user');
        }
      }
    } catch (error) {
      if (error.message && (error.message.includes('Database is not connected') || error.message.includes('503'))) {
        toast.error('User management is not available in demo mode. Please connect to a database to manage users.');
      } else {
        toast.error(error.message || 'An error occurred');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionToggle = async (userId, permissionId, hasPermission) => {
    try {
      if (hasPermission) {
        const response = await apiService.revokeUserPermission(userId, permissionId);
        if (response.success) {
          toast.success('Permission revoked successfully');
          // Update local state
          setUserPermissions(prev => ({
            ...prev,
            [userId]: prev[userId]?.filter(p => p.permission_id !== permissionId) || []
          }));
        } else {
          toast.error('Failed to revoke permission');
        }
      } else {
        const response = await apiService.assignUserPermission(userId, permissionId);
        if (response.success) {
          toast.success('Permission assigned successfully');
          // Update local state
          const permission = permissions.find(p => p.permission_id === permissionId);
          setUserPermissions(prev => ({
            ...prev,
            [userId]: [...(prev[userId] || []), permission]
          }));
        } else {
          toast.error('Failed to assign permission');
        }
      }
    } catch (error) {
      toast.error('Permission management is not available in demo mode');
    }
  };

  const getUserPermissionsForUser = (userId) => {
    return userPermissions[userId] || [];
  };

  const hasUserPermission = (userId, permissionId) => {
    const userPerms = getUserPermissionsForUser(userId);
    return userPerms.some(p => p.permission_id === permissionId);
  };

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'administrator':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'backend_developer':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'business_analyst':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getPermissionBadgeColor = (permissionName) => {
    if (permissionName.includes('manage')) {
      return 'bg-orange-100 text-orange-800 border border-orange-200';
    } else if (permissionName.includes('view')) {
      return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
    }
    return 'bg-purple-100 text-purple-800 border border-purple-200';
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiLock className="mx-auto text-red-500 text-4xl mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiShield className="text-3xl" />
            User Management & Permissions
          </h1>
          <p className="text-blue-100 mt-2">Manage users, roles, and permissions</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiUsers className="inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiKey className="inline mr-2" />
              Permission Management
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <>
              {/* User Management Tab */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                <button
                  onClick={handleCreateUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
                >
                  <FiPlus size={16} />
                  Create User
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search users by username or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                                  <FiUser className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.username}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {user.user_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role_name)}`}>
                              {user.role_name.charAt(0).toUpperCase() + user.role_name.slice(1).replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {user.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="View Details"
                              >
                                <FiUser size={18} />
                              </button>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Edit User"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.user_id, user.username)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete User"
                                disabled={user.user_id === user?.user_id}
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <FiUsers className="mx-auto text-gray-400 text-4xl mb-4" />
                    <p className="text-lg">No users found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'permissions' && (
            <>
              {/* Permission Management Tab */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Permission Management</h2>
                <p className="text-gray-600">Assign or revoke permissions for each user</p>
              </div>

              {/* Permission Matrix */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                          User
                        </th>
                        {permissions.map((permission) => (
                          <th key={permission.permission_id} className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                            <div className="flex flex-col items-center">
                              <span className="mb-1">{permission.permission_name.replace('_', ' ')}</span>
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getPermissionBadgeColor(permission.permission_name)}`}>
                                {permission.description}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                                  <FiUser className="h-5 w-5 text-white" />
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.username}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.role_name.replace('_', ' ')}
                                </div>
                              </div>
                            </div>
                          </td>
                          {permissions.map((permission) => {
                            const hasPermission = hasUserPermission(user.user_id, permission.permission_id);
                            return (
                              <td key={permission.permission_id} className="px-4 py-4 text-center">
                                <button
                                  onClick={() => handlePermissionToggle(user.user_id, permission.permission_id, hasPermission)}
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                                    hasPermission
                                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                  }`}
                                  title={hasPermission ? 'Click to revoke' : 'Click to assign'}
                                >
                                  {hasPermission ? <FiCheck size={16} /> : <FiX size={16} />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {users.length === 0 && (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <FiKey className="mx-auto text-gray-400 text-4xl mb-4" />
                    <p className="text-lg">No users to manage permissions</p>
                    <p className="text-sm text-gray-400">Create users first to manage their permissions</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FiUser className="text-blue-600" />
                {modalMode === 'create' ? 'Create New User' : 
                 modalMode === 'edit' ? 'Edit User' : 'User Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {modalMode === 'edit' && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
                    required={modalMode === 'create'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map(role => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {modalMode === 'view' && selectedUser && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">User ID:</span> 
                        <span>{selectedUser.user_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Role Description:</span> 
                        <span className="text-right max-w-[200px]">{selectedUser.description}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  >
                    {modalMode === 'create' ? 'Create User' : 'Update User'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;