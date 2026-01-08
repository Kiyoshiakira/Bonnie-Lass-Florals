const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('Chatbot Photo Management and Product Updates', function() {
  
  describe('Backend Controller - New Actions', function() {
    let chatbotController;
    
    before(function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      chatbotController = fs.readFileSync(controllerPath, 'utf8');
    });

    it('should support list_products action', function() {
      expect(chatbotController).to.include("case 'list_products':");
      expect(chatbotController).to.include('await Product.find()');
    });

    it('should support add_photos action', function() {
      expect(chatbotController).to.include("case 'add_photos':");
      expect(chatbotController).to.include('newImages');
    });

    it('should support remove_photos action', function() {
      expect(chatbotController).to.include("case 'remove_photos':");
      expect(chatbotController).to.include('imagesToRemove');
    });

    it('should escape regex special characters to prevent ReDoS', function() {
      expect(chatbotController).to.include("replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')");
    });

    it('should handle photo removal by index (1-based)', function() {
      expect(chatbotController).to.include('const index = item - 1');
    });

    it('should update images array when adding photos', function() {
      expect(chatbotController).to.include('const updatedImages = [...existingImages, ...imagesToAdd]');
    });

    it('should update images array when removing photos', function() {
      expect(chatbotController).to.include('remainingImages.splice(index, 1)');
    });
  });

  describe('Backend Controller - Admin Prompt Updates', function() {
    let chatbotController;
    
    before(function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      chatbotController = fs.readFileSync(controllerPath, 'utf8');
    });

    it('should document list_products command', function() {
      expect(chatbotController).to.include('LIST ALL PRODUCTS');
      expect(chatbotController).to.include('list products');
    });

    it('should document add_photos command', function() {
      expect(chatbotController).to.include('ADD PHOTOS TO PRODUCT');
      expect(chatbotController).to.include('add photos to');
    });

    it('should document remove_photos command', function() {
      expect(chatbotController).to.include('REMOVE PHOTOS FROM PRODUCT');
      expect(chatbotController).to.include('remove photos from');
    });

    it('should document interactive update mode', function() {
      expect(chatbotController).to.include('UPDATE PRODUCT - INTERACTIVE MODE');
      expect(chatbotController).to.include('what to update');
    });

    it('should include photo management in action format', function() {
      expect(chatbotController).to.include('list_products');
      expect(chatbotController).to.include('add_photos');
      expect(chatbotController).to.include('remove_photos');
      expect(chatbotController).to.include('newImages');
      expect(chatbotController).to.include('imagesToRemove');
    });
  });

  describe('Frontend Chatbot - File Upload Support', function() {
    let chatbotJs;
    
    before(function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      chatbotJs = fs.readFileSync(chatbotPath, 'utf8');
    });

    it('should have file input element', function() {
      expect(chatbotJs).to.include('chatbot-file-input');
      expect(chatbotJs).to.include('type="file"');
    });

    it('should have attach button', function() {
      expect(chatbotJs).to.include('chatbot-attach');
      expect(chatbotJs).to.include('chatbot-attach-button');
    });

    it('should have file preview container', function() {
      expect(chatbotJs).to.include('chatbot-file-preview');
    });

    it('should have selectedFiles state variable', function() {
      expect(chatbotJs).to.include('let selectedFiles = []');
    });

    it('should have handleFileSelect function', function() {
      expect(chatbotJs).to.include('function handleFileSelect(event)');
    });

    it('should have updateFilePreview function', function() {
      expect(chatbotJs).to.include('function updateFilePreview()');
    });

    it('should have removeFile function', function() {
      expect(chatbotJs).to.include('function removeFile(index)');
    });

    it('should have uploadImageToFirebase function', function() {
      expect(chatbotJs).to.include('async function uploadImageToFirebase(file)');
    });

    it('should have uploadAllFiles function', function() {
      expect(chatbotJs).to.include('async function uploadAllFiles()');
    });

    it('should validate file types', function() {
      expect(chatbotJs).to.include('ALLOWED_TYPES');
      expect(chatbotJs).to.include("'image/jpeg'");
      expect(chatbotJs).to.include("'image/png'");
      expect(chatbotJs).to.include("'image/webp'");
    });

    it('should validate file extensions', function() {
      expect(chatbotJs).to.include('ALLOWED_EXTENSIONS');
      expect(chatbotJs).to.include("'.jpg'");
      expect(chatbotJs).to.include("'.png'");
    });

    it('should validate file size', function() {
      expect(chatbotJs).to.include('MAX_FILE_SIZE');
      expect(chatbotJs).to.include('10 * 1024 * 1024');
    });

    it('should upload files to Firebase Storage', function() {
      expect(chatbotJs).to.include('firebase.storage()');
      expect(chatbotJs).to.include('product-images/');
    });

    it('should revoke blob URLs to prevent memory leaks', function() {
      expect(chatbotJs).to.include('URL.revokeObjectURL');
    });

    it('should handle file upload before sending message', function() {
      expect(chatbotJs).to.include('await uploadAllFiles()');
      expect(chatbotJs).to.include('Uploading photos...');
    });
  });

  describe('Frontend Chatbot - UI Styles', function() {
    let chatbotJs;
    
    before(function() {
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      chatbotJs = fs.readFileSync(chatbotPath, 'utf8');
    });

    it('should have styles for attach button', function() {
      expect(chatbotJs).to.include('.chatbot-attach-button');
    });

    it('should have styles for file preview', function() {
      expect(chatbotJs).to.include('.chatbot-file-preview');
    });

    it('should have styles for file items', function() {
      expect(chatbotJs).to.include('.chatbot-file-item');
    });

    it('should have styles for remove button', function() {
      expect(chatbotJs).to.include('.chatbot-file-remove');
    });

    it('should have styles for attach icon', function() {
      expect(chatbotJs).to.include('.attach-icon');
    });
  });

  describe('Documentation', function() {
    it('should have photo management documentation', function() {
      const docPath = path.join(__dirname, '..', 'CHATBOT_PHOTO_MANAGEMENT.md');
      expect(fs.existsSync(docPath)).to.be.true;
      
      const docContent = fs.readFileSync(docPath, 'utf8');
      expect(docContent).to.include('Photo Upload for New Products');
      expect(docContent).to.include('Add Photos to Existing Products');
      expect(docContent).to.include('Remove Photos from Products');
      expect(docContent).to.include('List All Products');
      expect(docContent).to.include('Update Product Information');
      expect(docContent).to.include('Interactive Product Selection');
    });

    it('should document security features', function() {
      const docPath = path.join(__dirname, '..', 'CHATBOT_PHOTO_MANAGEMENT.md');
      const docContent = fs.readFileSync(docPath, 'utf8');
      expect(docContent).to.include('Security');
      expect(docContent).to.include('Only admin users');
      expect(docContent).to.include('Firebase Storage security rules');
    });

    it('should document file requirements', function() {
      const docPath = path.join(__dirname, '..', 'CHATBOT_PHOTO_MANAGEMENT.md');
      const docContent = fs.readFileSync(docPath, 'utf8');
      expect(docContent).to.include('Supported File Types');
      expect(docContent).to.include('JPEG');
      expect(docContent).to.include('PNG');
      expect(docContent).to.include('10MB');
    });

    it('should include troubleshooting section', function() {
      const docPath = path.join(__dirname, '..', 'CHATBOT_PHOTO_MANAGEMENT.md');
      const docContent = fs.readFileSync(docPath, 'utf8');
      expect(docContent).to.include('Troubleshooting');
      expect(docContent).to.include('Firebase Storage is not available');
      expect(docContent).to.include('File size exceeds');
    });

    it('should include best practices', function() {
      const docPath = path.join(__dirname, '..', 'CHATBOT_PHOTO_MANAGEMENT.md');
      const docContent = fs.readFileSync(docPath, 'utf8');
      expect(docContent).to.include('Best Practices');
      expect(docContent).to.include('Optimize Images');
      expect(docContent).to.include('Multiple Angles');
    });
  });

  describe('Security Features', function() {
    let chatbotController;
    let chatbotJs;
    
    before(function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      chatbotController = fs.readFileSync(controllerPath, 'utf8');
      
      const chatbotPath = path.join(__dirname, '..', 'public', 'chatbot.js');
      chatbotJs = fs.readFileSync(chatbotPath, 'utf8');
    });

    it('should escape regex special characters in backend', function() {
      // Check for regex escaping in add_photos action
      expect(chatbotController).to.include("replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')");
    });

    it('should validate file extensions in frontend', function() {
      expect(chatbotJs).to.include('ALLOWED_EXTENSIONS');
      expect(chatbotJs).to.include('file.name.toLowerCase()');
    });

    it('should sanitize filenames in frontend', function() {
      expect(chatbotJs).to.include("replace(/[^a-zA-Z0-9._-]/g, '_')");
    });

    it('should validate file types in frontend', function() {
      expect(chatbotJs).to.include('if (!ALLOWED_TYPES.includes(file.type))');
    });

    it('should require admin authentication', function() {
      expect(chatbotController).to.include('checkIsAdmin');
    });
  });

  describe('Response Handling', function() {
    let chatbotController;
    
    before(function() {
      const controllerPath = path.join(__dirname, '..', 'backend', 'controllers', 'chatbotController.js');
      chatbotController = fs.readFileSync(controllerPath, 'utf8');
    });

    it('should handle photo add results', function() {
      expect(chatbotController).to.include('addedCount !== undefined');
    });

    it('should handle photo remove results', function() {
      expect(chatbotController).to.include('removedCount !== undefined');
    });

    it('should display product IDs in list', function() {
      expect(chatbotController).to.include("if (p._id) info += ` (ID: ${p._id})`");
    });

    it('should show success messages for photo operations', function() {
      expect(chatbotController).to.include('Successfully added');
      expect(chatbotController).to.include('photo(s) to');
      expect(chatbotController).to.include('Successfully removed');
    });
  });

});
