const { executeQuery } = require('../config/database');

// Get all permissions
const getAllPermissions = async (req, res) => {
  try {
    const permissionsQuery = 'SELECT * FROM permissions ORDER BY permission_id';
    const permissions = await executeQuery(permissionsQuery);

    res.json({
      success: true,
      data: { permissions }
    });

  } catch (error) {
    console.error('Get all permissions error:', error.message);
    
    // Fallback to mock data when database is not available
    const mockPermissions = [
      {
        permission_id: 1,
        permission_name: 'view_dashboard',
        description: 'View dashboard'
      },
      {
        permission_id: 2,
        permission_name: 'view_sales',
        description: 'View sales data'
      },
      {
        permission_id: 3,
        permission_name: 'manage_users',
        description: 'Manage users'
      },
      {
        permission_id: 4,
        permission_name: 'manage_products',
        description: 'Manage products'
      },
      {
        permission_id: 5,
        permission_name: 'manage_inventory',
        description: 'Manage inventory'
      },
      {
        permission_id: 6,
        permission_name: 'view_reports',
        description: 'View reports'
      }
    ];

    res.json({
      success: true,
      data: { permissions: mockPermissions }
    });
  }
};

// Get user permissions
const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const permissionsQuery = `
      SELECT p.permission_id, p.permission_name, p.description 
      FROM permissions p 
      JOIN user_permissions up ON p.permission_id = up.permission_id 
      WHERE up.user_id = ?
    `;
    
    const permissions = await executeQuery(permissionsQuery, [userId]);

    res.json({
      success: true,
      data: { permissions }
    });

  } catch (error) {
    console.error('Get user permissions error:', error.message);
    
    // Return empty permissions for demo mode
    res.json({
      success: true,
      data: { permissions: [] }
    });
  }
};

// Assign permission to user
const assignUserPermission = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permission_id } = req.body;

    // Check if user exists
    const userExists = await executeQuery(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );

    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if permission exists
    const permissionExists = await executeQuery(
      'SELECT permission_id FROM permissions WHERE permission_id = ?',
      [permission_id]
    );

    if (permissionExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    // Check if user already has this permission
    const existingPermission = await executeQuery(
      'SELECT * FROM user_permissions WHERE user_id = ? AND permission_id = ?',
      [userId, permission_id]
    );

    if (existingPermission.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already has this permission'
      });
    }

    // Assign permission to user
    await executeQuery(
      'INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)',
      [userId, permission_id]
    );

    res.json({
      success: true,
      message: 'Permission assigned successfully'
    });

  } catch (error) {
    console.error('Assign permission error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('connect')) {
      res.status(503).json({
        success: false,
        message: 'Database is not connected. Permission management is not available in demo mode.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

// Revoke permission from user
const revokeUserPermission = async (req, res) => {
  try {
    const { userId, permissionId } = req.params;

    // Check if user has this permission
    const existingPermission = await executeQuery(
      'SELECT * FROM user_permissions WHERE user_id = ? AND permission_id = ?',
      [userId, permissionId]
    );

    if (existingPermission.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User does not have this permission'
      });
    }

    // Revoke permission from user
    await executeQuery(
      'DELETE FROM user_permissions WHERE user_id = ? AND permission_id = ?',
      [userId, permissionId]
    );

    res.json({
      success: true,
      message: 'Permission revoked successfully'
    });

  } catch (error) {
    console.error('Revoke permission error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('connect')) {
      res.status(503).json({
        success: false,
        message: 'Database is not connected. Permission management is not available in demo mode.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

// Create new permission
const createPermission = async (req, res) => {
  try {
    const { permission_name, description } = req.body;

    // Check if permission already exists
    const existingPermission = await executeQuery(
      'SELECT permission_id FROM permissions WHERE permission_name = ?',
      [permission_name]
    );

    if (existingPermission.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Permission already exists'
      });
    }

    // Insert new permission
    const result = await executeQuery(
      'INSERT INTO permissions (permission_name, description) VALUES (?, ?)',
      [permission_name, description]
    );

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: { permission_id: result.insertId }
    });

  } catch (error) {
    console.error('Create permission error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('connect')) {
      res.status(503).json({
        success: false,
        message: 'Database is not connected. Permission creation is not available in demo mode.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = {
  getAllPermissions,
  getUserPermissions,
  assignUserPermission,
  revokeUserPermission,
  createPermission
};