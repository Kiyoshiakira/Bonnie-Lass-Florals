const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Admin Chatbot Functionality Tests', function() {
  
  describe('Backend Controller - Admin Features', function() {
    it('should import admin config in chatbot controller', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("require('../config/admins')");
      expect(controllerContent).to.include('isAdminEmail');
    });

    it('should import firebase admin in chatbot controller', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("require('../utils/firebaseAdmin')");
    });

    it('should have checkIsAdmin function', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('async function checkIsAdmin');
      expect(controllerContent).to.include('verifyIdToken');
    });

    it('should have parseAdminAction function', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('function parseAdminAction');
      expect(controllerContent).to.include('```json');
    });

    it('should have executeAdminAction function', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('async function executeAdminAction');
      expect(controllerContent).to.include('switch (action)');
    });

    it('should support create product action', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("case 'create':");
      expect(controllerContent).to.include('new Product');
    });

    it('should support update product action', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("case 'update':");
      expect(controllerContent).to.include('findById');
    });

    it('should support delete product action', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("case 'delete':");
      expect(controllerContent).to.include('findByIdAndDelete');
    });

    it('should support stats action', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("case 'stats':");
      expect(controllerContent).to.include('countDocuments');
    });

    it('should support low_stock action', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("case 'low_stock':");
    });

    it('should support out_of_stock action', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("case 'out_of_stock':");
    });

    it('should generate different prompts for admin and non-admin users', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('generateSystemPrompt(isAdmin');
      expect(controllerContent).to.include('ADMIN MODE ENABLED');
      expect(controllerContent).to.include('ADMIN COMMANDS');
    });

    it('should document admin commands in prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('CREATE PRODUCT');
      expect(controllerContent).to.include('UPDATE PRODUCT');
      expect(controllerContent).to.include('DELETE PRODUCT');
      expect(controllerContent).to.include('VIEW STATISTICS');
    });

    it('should check admin status in sendMessage', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('const isAdmin = await checkIsAdmin(req)');
    });

    it('should execute admin actions when detected', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('const actionData = parseAdminAction');
      expect(controllerContent).to.include('actionResult = await executeAdminAction');
    });

    it('should return isAdmin flag in response', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('isAdmin,');
      expect(controllerContent).to.include('actionResult');
    });
  });

  describe('Frontend Chatbot - Admin Integration', function() {
    it('should get Firebase auth token for authenticated users', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('firebase.auth().currentUser');
      expect(chatbotContent).to.include('getIdToken');
    });

    it('should send auth token in Authorization header', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include("headers['Authorization']");
      expect(chatbotContent).to.include('Bearer');
    });

    it('should have showAdminModeIndicator function', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('function showAdminModeIndicator');
    });

    it('should show admin mode indicator when admin is detected', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('if (data.isAdmin');
      expect(chatbotContent).to.include('showAdminModeIndicator()');
    });

    it('should display admin mode badge', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('Admin Mode Active');
      expect(chatbotContent).to.include('Product management enabled');
    });
  });

  describe('Security', function() {
    it('should verify admin status server-side', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      // Ensure admin check happens on server, not just client
      expect(controllerContent).to.include('checkIsAdmin(req)');
      expect(controllerContent).to.include('verifyIdToken');
    });

    it('should only execute admin actions for verified admin users', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('if (isAdmin)');
      expect(controllerContent).to.include('executeAdminAction');
    });

    it('should use isAdminEmail for authorization', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('isAdminEmail(decoded.email)');
    });
  });

  describe('Product Management Actions', function() {
    it('should validate required fields for product creation', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('!productData.name');
      expect(controllerContent).to.include('productData.price === undefined');
      expect(controllerContent).to.include('Missing required fields');
    });

    it('should support finding products by ID or name', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('if (productId)');
      expect(controllerContent).to.include('else if (productName)');
      expect(controllerContent).to.include('findOne');
    });

    it('should return success/error status for actions', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('success: true');
      expect(controllerContent).to.include('success: false');
    });
  });
});
