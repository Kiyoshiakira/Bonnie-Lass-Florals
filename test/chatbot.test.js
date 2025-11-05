const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Chatbot Integration Tests', function() {
  
  describe('Backend Routes', function() {
    it('should have chatbot routes file', function() {
      const routesPath = path.join(__dirname, '..', 'backend', 'routes', 'chatbot.js');
      expect(fs.existsSync(routesPath)).to.be.true;
    });

    it('should export chatbot routes module', function() {
      const chatbotRoutes = require('../backend/routes/chatbot');
      expect(chatbotRoutes).to.be.a('function');
    });
  });

  describe('Backend Controller', function() {
    it('should have chatbot controller file', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      expect(fs.existsSync(controllerPath)).to.be.true;
    });

    it('should export chatbot controller functions', function() {
      const chatbotController = require('../backend/controllers/chatbotController');
      expect(chatbotController).to.be.an('object');
      expect(chatbotController.sendMessage).to.be.a('function');
      expect(chatbotController.getStatus).to.be.a('function');
    });
  });

  describe('Frontend Chatbot Widget', function() {
    it('should have chatbot.js file', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      expect(fs.existsSync(chatbotPath)).to.be.true;
    });

    it('should contain chatbot HTML structure creation', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('chatbot-widget');
      expect(chatbotContent).to.include('chatbot-toggle');
      expect(chatbotContent).to.include('chatbot-window');
      expect(chatbotContent).to.include('chatbot-messages');
      expect(chatbotContent).to.include('chatbot-input');
    });

    it('should include Gemini branding', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('Powered by Google Gemini');
    });

    it('should use SVG icons for chatbot interface', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('chatbot-icon');
      expect(chatbotContent).to.include('chatbot-avatar');
      expect(chatbotContent).to.include('<svg');
    });

    it('should have sendMessage function', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('async function sendMessage');
    });

    it('should call chatbot API endpoint', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('/api/chatbot');
    });

    it('should handle chat history', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('chatHistory');
    });
  });

  describe('Page Integration', function() {
    const pagesToCheck = ['index.html', 'shop.html', 'about.html', 'gallery.html', 'contact.html'];

    pagesToCheck.forEach(page => {
      it(`should include chatbot.js in ${page}`, function() {
        const pagePath = path.join(__dirname, '..', 'public', page);
        if (fs.existsSync(pagePath)) {
          const pageContent = fs.readFileSync(pagePath, 'utf8');
          expect(pageContent).to.include('chatbot.js');
        }
      });
    });
  });

  describe('Backend Route Registration', function() {
    it('should register chatbot routes in backend/index.js', function() {
      const indexPath = path.join(__dirname, '..', 'backend', 'index.js');
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      expect(indexContent).to.include('/api/chatbot');
      expect(indexContent).to.include("require('./routes/chatbot')");
    });
  });

  describe('Dependencies', function() {
    it('should have @google/generative-ai package in package.json', function() {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      expect(packageJson.dependencies).to.have.property('@google/generative-ai');
    });
  });

  describe('Product Integration', function() {
    it('should use Product model in chatbot controller', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("require('../models/Product')");
      expect(controllerContent).to.include('Product.find');
    });

    it('should include product context in system prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('getProductContext');
      expect(controllerContent).to.include('generateSystemPrompt');
    });

    it('should provide product information fields', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      // Check for key product fields
      expect(controllerContent).to.include('name');
      expect(controllerContent).to.include('description');
      expect(controllerContent).to.include('price');
      expect(controllerContent).to.include('stock');
      expect(controllerContent).to.include('type');
    });
  });

  describe('Security Features', function() {
    it('should have rate limiting on chatbot routes', function() {
      const routesPath = path.join(__dirname, '..', 'backend', 'routes', 'chatbot.js');
      const routesContent = fs.readFileSync(routesPath, 'utf8');
      expect(routesContent).to.include('rateLimit');
      expect(routesContent).to.include('chatbotLimiter');
    });

    it('should validate message input', function() {
      const routesPath = path.join(__dirname, '..', 'backend', 'routes', 'chatbot.js');
      const routesContent = fs.readFileSync(routesPath, 'utf8');
      expect(routesContent).to.include('body(\'message\')');
      expect(routesContent).to.include('validationResult');
    });

    it('should escape HTML in frontend to prevent XSS', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('escapeHtml');
    });
  });

  describe('UI/UX Features', function() {
    it('should have loading indicator', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('showLoading');
      expect(chatbotContent).to.include('hideLoading');
      expect(chatbotContent).to.include('chatbot-loading');
    });

    it('should have toggle functionality', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('toggleChatbot');
    });

    it('should have auto-resize textarea', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('autoResizeTextarea');
    });

    it('should support Enter to send (Shift+Enter for new line)', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('e.key === \'Enter\'');
      expect(chatbotContent).to.include('!e.shiftKey');
    });

    it('should have responsive design styles', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('@media');
      expect(chatbotContent).to.include('max-width: 480px');
    });
  });

  describe('Error Handling', function() {
    it('should handle errors in sendMessage', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('try {');
      expect(controllerContent).to.include('catch (error)');
      expect(controllerContent).to.include('logger.error');
    });

    it('should display error messages to user in frontend', function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');
      expect(chatbotContent).to.include('catch (error)');
      expect(chatbotContent).to.include('showErrorMessage');
      expect(chatbotContent).to.include('chatbot-error');
    });
  });

});
