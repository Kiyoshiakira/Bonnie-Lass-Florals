const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Admin Chatbot - Merge Products Functionality Tests', function() {
  
  describe('Merge Products Feature', function() {
    it('should include merge_products in admin prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('MERGE PRODUCTS');
      expect(controllerContent).to.include('merge_products');
    });

    it('should include add_to_group in admin prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('ADD TO GROUP');
      expect(controllerContent).to.include('add_to_group');
    });

    it('should support merge_products action in executeAdminAction', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("case 'merge_products':");
    });

    it('should support add_to_group action in executeAdminAction', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("case 'add_to_group':");
    });

    it('should include merge_products in action list in SMART RESPONSE FORMAT', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      // Find the SMART RESPONSE FORMAT section
      const smartResponseSection = controllerContent.match(/SMART RESPONSE FORMAT:[\s\S]*?```json[\s\S]*?```/);
      expect(smartResponseSection).to.not.be.null;
      expect(smartResponseSection[0]).to.include('merge_products');
      expect(smartResponseSection[0]).to.include('add_to_group');
    });

    it('should include productNames field in SMART RESPONSE FORMAT', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const smartResponseSection = controllerContent.match(/SMART RESPONSE FORMAT:[\s\S]*?```json[\s\S]*?```/);
      expect(smartResponseSection).to.not.be.null;
      expect(smartResponseSection[0]).to.include('productNames');
    });

    it('should include groupName field in SMART RESPONSE FORMAT', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const smartResponseSection = controllerContent.match(/SMART RESPONSE FORMAT:[\s\S]*?```json[\s\S]*?```/);
      expect(smartResponseSection).to.not.be.null;
      expect(smartResponseSection[0]).to.include('groupName');
    });
  });

  describe('Merge Products Implementation', function() {
    it('should validate groupName is required for merge_products', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const mergeSection = controllerContent.match(/case 'merge_products':[\s\S]*?(?=case '|default:)/);
      expect(mergeSection).to.not.be.null;
      expect(mergeSection[0]).to.include('Group name is required');
    });

    it('should validate at least one product is required for merge_products', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const mergeSection = controllerContent.match(/case 'merge_products':[\s\S]*?(?=case '|default:)/);
      expect(mergeSection).to.not.be.null;
      expect(mergeSection[0]).to.include('At least one product');
    });

    it('should use Product.updateMany to set productGroup for merge_products', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const mergeSection = controllerContent.match(/case 'merge_products':[\s\S]*?(?=case '|default:)/);
      expect(mergeSection).to.not.be.null;
      expect(mergeSection[0]).to.include('Product.updateMany');
      expect(mergeSection[0]).to.include('productGroup');
    });

    it('should return success message with modified count for merge_products', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const mergeSection = controllerContent.match(/case 'merge_products':[\s\S]*?(?=case '|default:)/);
      expect(mergeSection).to.not.be.null;
      expect(mergeSection[0]).to.include('modifiedCount');
      expect(mergeSection[0]).to.include('Successfully merged');
    });
  });

  describe('Add to Group Implementation', function() {
    it('should validate groupName is required for add_to_group', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const addSection = controllerContent.match(/case 'add_to_group':[\s\S]*?(?=case '|default:)/);
      expect(addSection).to.not.be.null;
      expect(addSection[0]).to.include('Group name is required');
    });

    it('should validate at least one product is required for add_to_group', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const addSection = controllerContent.match(/case 'add_to_group':[\s\S]*?(?=case '|default:)/);
      expect(addSection).to.not.be.null;
      expect(addSection[0]).to.include('At least one product');
    });

    it('should use Product.updateMany to set productGroup for add_to_group', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const addSection = controllerContent.match(/case 'add_to_group':[\s\S]*?(?=case '|default:)/);
      expect(addSection).to.not.be.null;
      expect(addSection[0]).to.include('Product.updateMany');
      expect(addSection[0]).to.include('productGroup');
    });

    it('should return success message with modified count for add_to_group', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const addSection = controllerContent.match(/case 'add_to_group':[\s\S]*?(?=case '|default:)/);
      expect(addSection).to.not.be.null;
      expect(addSection[0]).to.include('modifiedCount');
      expect(addSection[0]).to.include('Successfully added');
    });
  });

  describe('Natural Language Examples', function() {
    it('should provide natural language examples for merge_products', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      expect(controllerContent).to.include('Merge [product1], [product2]');
      expect(controllerContent).to.include('Group [products] together');
      expect(controllerContent).to.include('Create a panel called');
    });

    it('should provide natural language examples for add_to_group', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      expect(controllerContent).to.include('Add [product] to the [group name] panel');
      expect(controllerContent).to.include('Put [product] in the [group name] group');
    });

    it('should provide concrete examples for merge_products', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      expect(controllerContent).to.include('BBQ Sauce, Hot Sauce');
      expect(controllerContent).to.include('Strawberry Jam, Blueberry Jam');
    });

    it('should provide concrete examples for add_to_group', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      expect(controllerContent).to.include('add Mustard to the Sauces group');
      expect(controllerContent).to.include('add Peanut Butter Cookies to Cookies panel');
    });
  });

  describe('Product Group Field Support', function() {
    it('should support productNames array for identifying products to merge', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const mergeSection = controllerContent.match(/case 'merge_products':[\s\S]*?(?=case '|default:)/);
      expect(mergeSection).to.not.be.null;
      expect(mergeSection[0]).to.include('productNames');
      expect(mergeSection[0]).to.include('mergeNames');
    });

    it('should support productIds array for identifying products to merge', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const mergeSection = controllerContent.match(/case 'merge_products':[\s\S]*?(?=case '|default:)/);
      expect(mergeSection).to.not.be.null;
      expect(mergeSection[0]).to.include('productIds');
      expect(mergeSection[0]).to.include('mergeIds');
    });

    it('should handle case-insensitive product name matching', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const mergeSection = controllerContent.match(/case 'merge_products':[\s\S]*?(?=case '|default:)/);
      expect(mergeSection).to.not.be.null;
      expect(mergeSection[0]).to.include('RegExp');
      expect(mergeSection[0]).to.include("'i'"); // case-insensitive flag
    });

    it('should escape special regex characters in product names', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const mergeSection = controllerContent.match(/case 'merge_products':[\s\S]*?(?=case '|default:)/);
      expect(mergeSection).to.not.be.null;
      expect(mergeSection[0]).to.include('replace(/[.*+?^${}()|[\\]\\\\]/g');
    });
  });

  describe('Logging and Error Handling', function() {
    it('should log merge operations', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const mergeSection = controllerContent.match(/case 'merge_products':[\s\S]*?(?=case '|default:)/);
      expect(mergeSection).to.not.be.null;
      expect(mergeSection[0]).to.include('logger.info');
      expect(mergeSection[0]).to.include('Merged');
    });

    it('should log add to group operations', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const addSection = controllerContent.match(/case 'add_to_group':[\s\S]*?(?=case '|default:)/);
      expect(addSection).to.not.be.null;
      expect(addSection[0]).to.include('logger.info');
      expect(addSection[0]).to.include('Added');
    });

    it('should return error when no products found for merge', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const mergeSection = controllerContent.match(/case 'merge_products':[\s\S]*?(?=case '|default:)/);
      expect(mergeSection).to.not.be.null;
      expect(mergeSection[0]).to.include('No products found');
    });

    it('should return error when no products found for add to group', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      const addSection = controllerContent.match(/case 'add_to_group':[\s\S]*?(?=case '|default:)/);
      expect(addSection).to.not.be.null;
      expect(addSection[0]).to.include('No products found');
    });
  });
});
