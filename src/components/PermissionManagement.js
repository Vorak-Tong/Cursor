import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { FiUser, FiKey, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PermissionManagement = () => {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      if (response.success && response.data) {
        setUsers(response.data.users);
      } else if (Array.isArray(response)) {
        setUsers(response);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await apiService.getPermissions();
      if (response.success && response.data) {
        setPermissions(response.data.permissions);
      } else if (Array.isArray(response)) {
        setPermissions(response);
      }
    } catch (error) {
      toast.error('Failed to load permissions');
    }
  };

  const getUserPermissionsForUser = (userId) => {
    return userPermissions[userId] || [];
  };

  const hasUserPermission = (userId, permissionId) => {
    const userPerms = getUserPermissionsForUser(userId);
    return userPerms.some(p => p.permission_id === permissionId);
  };

  const handlePermissionToggle = async (userId, permissionId, hasPermission) => {
    try {
      if (hasPermission) {
        const response = await apiService.revokeUserPermission(userId, permissionId);
        if (response.success) {
          toast.success('Permission revoked successfully');
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

  useEffect(() => {
    // Fetch user permissions for all users
    const fetchAllUserPermissions = async () => {
      const perms = {};
      for (const user of users) {
        try {
          const response = await apiService.getUserPermissions(user.user_id);
          if (response.success && response.data) {
            perms[user.user_id] = response.data.permissions || [];
          } else {
            perms[user.user_id] = [];
          }
        } catch {
          perms[user.user_id] = [];
        }
      }
      setUserPermissions(perms);
    };
    if (users.length > 0) fetchAllUserPermissions();
  }, [users]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Permission Management</h2>
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
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 border border-gray-200">
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
    </div>
  );
};

export default PermissionManagement; 