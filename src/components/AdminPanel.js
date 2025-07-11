import React, { useState } from 'react';
import UserManagement from './UserManagement';
import PermissionManagement from './PermissionManagement';
import CreateUser from './CreateUser';
import { FiUsers, FiKey, FiPlus } from 'react-icons/fi';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Admin Panel
          </h1>
          <p className="text-blue-100 mt-2">Create users, manage users, and assign/revoke permissions</p>
        </div>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiPlus className="inline mr-2" />
              Create User
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiUsers className="inline mr-2" />
              Manage Users
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
              Permissions
            </button>
          </nav>
        </div>
        <div className="p-6">
          {activeTab === 'create' && <CreateUser />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'permissions' && <PermissionManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 