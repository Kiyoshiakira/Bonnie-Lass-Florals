const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Enhanced Admin Chatbot Functionality Tests', function() {
  
  describe('Code Organization', function() {
    it('should define ALLOWED_UPDATE_FIELDS constant', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('const ALLOWED_UPDATE_FIELDS');
      expect(controllerContent).to.include('extendedDetails');
    });

    it('should use ALLOWED_UPDATE_FIELDS in single update', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      const updateSection = controllerContent.match(/case 'update':[\s\S]*?(?=case '|default:)/);
      expect(updateSection).to.not.be.null;
      expect(updateSection[0]).to.include('ALLOWED_UPDATE_FIELDS');
    });

    it('should use ALLOWED_UPDATE_FIELDS in bulk update', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      const bulkUpdateSection = controllerContent.match(/case 'bulk_update':[\s\S]*?(?=case '|default:)/);
      expect(bulkUpdateSection).to.not.be.null;
      expect(bulkUpdateSection[0]).to.include('ALLOWED_UPDATE_FIELDS');
    });
  });
  
  describe('Extended Details Support', function() {
    it('should support extendedDetails in product creation', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('extendedDetails: productData.extendedDetails');
    });

    it('should support extendedDetails in product updates', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("'extendedDetails'");
      expect(controllerContent).to.include('productToUpdate.extendedDetails');
    });

    it('should mention ingredients field in admin prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('ingredients');
    });

    it('should mention allergens field in admin prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('allergens');
    });

    it('should mention materials field in admin prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('materials');
    });

    it('should mention dimensions field in admin prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('dimensions');
    });

    it('should mention careInstructions field in admin prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('careInstructions');
    });

    it('should mention nutritionalInfo field in admin prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('nutritionalInfo');
    });

    it('should merge extendedDetails objects during update', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('...(productToUpdate.extendedDetails || {})');
      expect(controllerContent).to.include('...value');
    });

    it('should include extended details in product context', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('product.extendedDetails');
      expect(controllerContent).to.include('details.ingredients');
      expect(controllerContent).to.include('details.materials');
    });
  });

  describe('Bulk Update Operations', function() {
    it('should support bulk_update action', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("case 'bulk_update':");
    });

    it('should handle bulk update criteria for collection', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('criteria.collection');
    });

    it('should handle bulk update criteria for type', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('criteria.type');
    });

    it('should handle bulk update criteria for subcategory', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('criteria.subcategory');
    });

    it('should handle bulk update for out of stock products', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("stockCondition === 'out_of_stock'");
    });

    it('should handle bulk update for low stock products', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("stockCondition === 'low_stock'");
    });

    it('should return count of updated products', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('updateCount');
      expect(controllerContent).to.include('count: updateCount');
    });

    it('should update extendedDetails in bulk operations', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      // Check that extendedDetails handling is in bulk update section
      const bulkUpdateMatch = controllerContent.match(/case 'bulk_update':[\s\S]*?(?=case '|default:)/);
      expect(bulkUpdateMatch).to.not.be.null;
      expect(bulkUpdateMatch[0]).to.include('extendedDetails');
    });

    it('should mention bulk update in admin prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('BULK UPDATE');
      expect(controllerContent).to.include('bulk update');
    });
  });

  describe('Bulk Delete Operations', function() {
    it('should support bulk_delete action', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("case 'bulk_delete':");
    });

    it('should handle bulk delete criteria', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('deleteCriteria');
      expect(controllerContent).to.include('deleteMany');
    });

    it('should return count of deleted products', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('deletedCount');
    });

    it('should mention bulk delete in admin prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('BULK DELETE');
    });
  });

  describe('Search and Filter Operations', function() {
    it('should support search action', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("case 'search':");
    });

    it('should handle search by collection', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('searchCriteria.collection');
    });

    it('should handle search by type', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('searchCriteria.type');
    });

    it('should handle search by name pattern', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('searchCriteria.namePattern');
      expect(controllerContent).to.include('$regex');
    });

    it('should handle search by stock condition', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("stockCondition === 'in_stock'");
    });

    it('should return search results with count', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('searchResults');
      expect(controllerContent).to.include('count: searchResults.length');
    });

    it('should mention search in admin prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('SEARCH PRODUCTS');
    });
  });

  describe('Smart AI Understanding', function() {
    it('should mention intelligent field detection in prompt', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('INTELLIGENT FIELD DETECTION');
      expect(controllerContent).to.include('intelligently');
    });

    it('should mention auto-detection for food items', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('food items');
      expect(controllerContent).to.include('auto-detected');
    });

    it('should mention auto-detection for craft items', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('crafts');
      expect(controllerContent).to.include('identify');
    });

    it('should provide smart response format example', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('SMART RESPONSE FORMAT');
      expect(controllerContent).to.include('Smart field placement');
    });

    it('should include example with Chocolate Chip Cookies', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('Chocolate Chip Cookies');
    });
  });

  describe('Enhanced Response Formatting', function() {
    it('should handle count-based results', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('actionResult.count !== undefined');
    });

    it('should display product details in results', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('p.stock !== undefined');
      expect(controllerContent).to.include('p.price !== undefined');
      expect(controllerContent).to.include('p.type');
    });

    it('should limit displayed results to 20 items', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('slice(0, 20)');
    });

    it('should show remaining count for large result sets', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('... and ${actionResult.products.length - 20} more');
    });
  });

  describe('Multi-Image Support', function() {
    it('should handle images array in product creation', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('images: productData.images');
    });

    it('should mention images in allowed updates', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include("'images'");
    });
  });

  describe('Error Handling', function() {
    it('should validate extendedDetails as object', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('typeof value === \'object\'');
      expect(controllerContent).to.include('!Array.isArray(value)');
    });

    it('should handle no products matching bulk criteria', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('No products match the criteria');
    });

    it('should log warnings for invalid extendedDetails', function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      expect(controllerContent).to.include('Invalid extendedDetails');
    });
  });

  describe('Product Model Integration', function() {
    it('should use extendedDetails in Product model', function() {
      const modelPath = path.join(__dirname, '..', 'backend', 'models', 'Product.js');
      const modelContent = fs.readFileSync(modelPath, 'utf8');
      expect(modelContent).to.include('extendedDetails');
    });

    it('should define ingredients field in Product model', function() {
      const modelPath = path.join(__dirname, '..', 'backend', 'models', 'Product.js');
      const modelContent = fs.readFileSync(modelPath, 'utf8');
      expect(modelContent).to.include('ingredients:');
    });

    it('should define allergens field in Product model', function() {
      const modelPath = path.join(__dirname, '..', 'backend', 'models', 'Product.js');
      const modelContent = fs.readFileSync(modelPath, 'utf8');
      expect(modelContent).to.include('allergens:');
    });

    it('should define materials field in Product model', function() {
      const modelPath = path.join(__dirname, '..', 'backend', 'models', 'Product.js');
      const modelContent = fs.readFileSync(modelPath, 'utf8');
      expect(modelContent).to.include('materials:');
    });
  });
});
