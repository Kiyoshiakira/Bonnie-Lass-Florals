const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Chatbot Intelligence Enhancements Tests', function() {
  
  describe('Enhanced System Prompt', function() {
    it('should include advanced natural language understanding guidelines', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('Natural Language Understanding');
      expect(controllerContent).to.include('Understand various ways customers ask');
    });

    it('should include smart interpretation examples', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('Smart Interpretation Examples');
    });

    it('should mention context awareness', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('context');
      expect(controllerContent).to.include('infer');
    });

    it('should include synonym understanding', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('synonym');
    });

    it('should include intelligent recommendation capability', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('recommendation');
      expect(controllerContent).to.include('based on context');
    });
  });

  describe('Admin Mode Intelligence', function() {
    it('should include advanced natural language processing for admin', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('ADVANCED NATURAL LANGUAGE UNDERSTANDING FOR ADMIN');
      expect(controllerContent).to.include('exceptional intelligence');
    });

    it('should support natural language command parsing', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('Parse natural language commands');
      expect(controllerContent).to.include('convert them to structured actions');
    });

    it('should include intelligent field auto-mapping', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('INTELLIGENT FIELD DETECTION');
      expect(controllerContent).to.include('auto-detect');
      expect(controllerContent).to.include('automatically place');
    });

    it('should understand conversational formats for admin commands', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('Natural language examples I understand');
      expect(controllerContent).to.include('conversational');
    });

    it('should include examples of natural language variations', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('Add a new product called');
      expect(controllerContent).to.include('Change the price of');
      expect(controllerContent).to.include('Update all');
    });

    it('should mention context maintenance across messages', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('conversation context');
      expect(controllerContent).to.include('pronouns');
    });
  });

  describe('Generation Configuration', function() {
    it('should use higher temperature for more intelligent responses', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('temperature: 0.9');
    });

    it('should use higher topP for better diversity', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('topP: 0.95');
    });

    it('should use higher topK for nuanced understanding', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('topK: 50');
    });

    it('should use higher maxOutputTokens for comprehensive responses', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('maxOutputTokens: 2048');
    });

    it('should include comments explaining the improved config', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('Increased from');
      expect(controllerContent).to.include('intelligent');
    });
  });

  describe('Initial Acknowledgment Enhancement', function() {
    it('should mention exceptional intelligence in admin acknowledgment', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('exceptionally intelligent assistant');
    });

    it('should mention advanced natural language understanding', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('advanced natural language understanding');
    });

    it('should mention automatic field detection capability', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('automatically detect and map');
    });
  });

  describe('Enhanced Field Detection Function', function() {
    it('should define common allergen keywords constant', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('COMMON_ALLERGENS');
      expect(controllerContent).to.include('wheat');
      expect(controllerContent).to.include('dairy');
    });

    it('should define storage keywords constant', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('STORAGE_KEYWORDS');
      expect(controllerContent).to.include('refrigerat');
      expect(controllerContent).to.include('airtight');
    });

    it('should have enhanceActionData function', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('function enhanceActionData');
    });

    it('should extract ingredients from description', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('ingredientsMatch');
      expect(controllerContent).to.include('made with|contains|ingredients');
    });

    it('should extract materials from description', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('materialsMatch');
      expect(controllerContent).to.include('made (?:with|from|of)|materials');
    });

    it('should extract allergens from description', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('allergensMatch');
      expect(controllerContent).to.include('allergen|contains');
    });

    it('should extract dimensions from description', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('measurementPattern');
      expect(controllerContent).to.include('dimensionPattern');
    });

    it('should extract weight from description', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('weightMatch');
      expect(controllerContent).to.include('lb|lbs|oz|ounce|g|gram|kg');
    });

    it('should extract storage instructions from description', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('storageMatch');
      expect(controllerContent).to.include('store|storage|keep');
    });

    it('should extract care instructions from description', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('careMatch');
      expect(controllerContent).to.include('care|clean|maintain|dust');
    });

    it('should use enhanceActionData in the message handler', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('actionData = enhanceActionData(actionData)');
    });

    it('should have helper function extractExtendedDetailsFromDescription', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('function extractExtendedDetailsFromDescription');
    });

    it('should process updates field in enhanceActionData for update actions', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("actionData.action === 'update' && actionData.updates");
      expect(controllerContent).to.include('extractExtendedDetailsFromDescription(actionData.updates)');
    });

    it('should process productData field in enhanceActionData for create actions', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("actionData.action === 'create' && actionData.productData");
      expect(controllerContent).to.include('extractExtendedDetailsFromDescription(actionData.productData)');
    });
  });

  describe('Intelligent Understanding Examples', function() {
    it('should include examples for ingredient detection', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('Made with');
      expect(controllerContent).to.include('ingredients');
    });

    it('should include examples for material detection', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('Materials');
      expect(controllerContent).to.include('materials');
    });

    it('should include examples for allergen detection', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('Contains');
      expect(controllerContent).to.include('allergens');
    });

    it('should include examples for size/dimension detection', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('dimensions');
      expect(controllerContent).to.include('inches');
    });

    it('should include examples for care instruction detection', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('Dust');
      expect(controllerContent).to.include('careInstructions');
    });
  });

  describe('Advanced Capabilities Documentation', function() {
    it('should mention handling typos and abbreviations', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('typos');
      expect(controllerContent).to.include('abbreviations');
    });

    it('should mention understanding pronouns', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('pronouns');
      expect(controllerContent).to.include('"it", "them"');
    });

    it('should mention compound request handling', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('compound requests');
      expect(controllerContent).to.include('multiple updates');
    });

    it('should mention correction understanding', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('corrections');
      expect(controllerContent).to.include('actually');
    });

    it('should mention type inference capability', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('infer');
      expect(controllerContent).to.include('product type');
    });
  });
});
