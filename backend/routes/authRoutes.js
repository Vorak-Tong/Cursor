const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const permissionController = require('../controllers/permissionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Authentication routes
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/refresh', authenticateToken, authController.refreshToken);

// User management routes (Admin only)
router.get('/users', authenticateToken, requireAdmin, userController.getAllUsers);
router.get('/users/:id', authenticateToken, requireAdmin, userController.getUserById);
router.post('/users', authenticateToken, requireAdmin, validate(schemas.user), userController.createUser);
router.put('/users/:id', authenticateToken, requireAdmin, validate(schemas.userUpdate), userController.updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, userController.deleteUser);
router.patch('/users/:id/role', authenticateToken, requireAdmin, userController.updateUserRole);

// Role routes
router.get('/roles', authenticateToken, userController.getRoles);

// Permission management routes (Admin only)
router.get('/permissions', authenticateToken, requireAdmin, permissionController.getAllPermissions);
router.get('/users/:userId/permissions', authenticateToken, requireAdmin, permissionController.getUserPermissions);
router.post('/users/:userId/permissions', authenticateToken, requireAdmin, permissionController.assignUserPermission);
router.delete('/users/:userId/permissions/:permissionId', authenticateToken, requireAdmin, permissionController.revokeUserPermission);
router.post('/permissions', authenticateToken, requireAdmin, permissionController.createPermission);

module.exports = router;