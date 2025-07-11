import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const CreateUser = () => {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiService.getRoles();
        if (response.success && response.data) {
          setRoles(response.data.roles);
        } else if (Array.isArray(response)) {
          setRoles(response);
        }
      } catch (error) {
        toast.error('Failed to load roles');
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiService.createUser(formData);
      if (response.success) {
        toast.success('User created successfully');
        setFormData({ username: '', password: '', role_id: '' });
      } else {
        toast.error(response.message || 'Failed to create user');
      }
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            name="role_id"
            value={formData.role_id}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
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
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default CreateUser; 