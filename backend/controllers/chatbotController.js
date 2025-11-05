const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const logger = require('../utils/logger');
const { isAdminEmail } = require('../config/admins');
const admin = require('../utils/firebaseAdmin');

// Initialize Gemini API
// Require API key from environment variable
let genAI = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn('GEMINI_API_KEY environment variable is not set. Chatbot will not function.');
  } else {
    genAI = new GoogleGenerativeAI(apiKey);
    logger.info('Gemini AI initialized successfully');
  }
} catch (error) {
  logger.error('Failed to initialize Gemini AI:', error);
}

/**
 * Get product information to use as context for the chatbot
 */
async function getProductContext() {
  try {
    const products = await Product.find({});
    
    // Format product information for the chatbot
    const productInfo = products.map(product => {
      const info = {
        name: product.name,
        description: product.description,
        price: product.price,
        type: product.type,
        subcategory: product.subcategory,
        stock: product.stock,
        inStock: product.stock > 0,
      };
      
      // Add optional fields if they exist
      if (product.options && product.options.length > 0) {
        info.options = product.options.join(', ');
      }
      if (product.collection) {
        info.collection = product.collection;
      }
      if (product.occasion) {
        info.occasion = product.occasion;
      }
      
      return info;
    });
    
    return productInfo;
  } catch (error) {
    logger.error('Error fetching product context:', error);
    return [];
  }
}

/**
 * Generate system prompt with product context
 */
async function generateSystemPrompt(isAdmin = false) {
  const products = await getProductContext();
  
  const basePrompt = `You are a friendly and knowledgeable customer service chatbot for Bonnie Lass Florals, a business specializing in handmade silk floral arrangements, wreaths, crafts, and cottage food products.

Your role:
- Help customers find products they're looking for
- Answer questions about products, pricing, stock availability, and details
- Provide information about materials used in floral crafts
- Be warm, helpful, and enthusiastic about the handmade products

Available Products:
${JSON.stringify(products, null, 2)}

Important guidelines:
- For floral crafts and arrangements (type: "decor"), you can discuss materials like silk flowers, ribbons, decorative elements, and bases used
- For cottage foods (type: "food"), provide information about ingredients if available in the description, and mention that these are homemade products
- Always mention stock availability when discussing specific products
- If a product is out of stock (stock: 0), let customers know but offer similar alternatives
- For pricing questions, provide exact prices from the product data
- For products with options (like sizes), mention the available options
- If asked about collections (christmas, fall, easter, etc.) or occasions (wedding, birthday, etc.), filter products accordingly
- Be honest if you don't have specific information - don't make up details about ingredients or materials
- Keep responses conversational and friendly, not overly formal
- If customers want to purchase, direct them to the shop page

Note: Since this is a small family business, detailed ingredient lists and pH levels may not be available for all cottage food items. Focus on what information you have and the homemade quality of the products.`;

  const adminPrompt = `

--- ADMIN MODE ENABLED ---

As an admin user, you have additional capabilities:

ADMIN COMMANDS:
Use these commands to manage the store:

1. CREATE PRODUCT
   Format: "create product: {name: 'Product Name', price: 29.99, description: 'Description', type: 'decor' or 'food', stock: 10, subcategory: 'wreaths', options: ['Small', 'Medium'], collection: 'christmas', occasion: 'wedding', image: 'url'}"
   - Creates a new product with the specified details
   - Required fields: name, price
   - Optional fields: description, type (default: 'decor'), stock (default: 1), subcategory, options, collection, occasion, image

2. UPDATE PRODUCT
   Format: "update product [ID or name]: {field: value, ...}"
   Examples:
   - "update product 507f1f77bcf86cd799439011: {price: 39.99, stock: 5}"
   - "update product Christmas Wreath: {stock: 0}"
   - You can update: name, description, price, type, stock, subcategory, options, collection, occasion, image

3. DELETE PRODUCT
   Format: "delete product [ID or name]"
   Example: "delete product 507f1f77bcf86cd799439011" or "delete product Christmas Wreath"

4. VIEW STATISTICS
   Commands:
   - "show stats" - Display overall store statistics
   - "show low stock" - List products with stock < 5
   - "show out of stock" - List products with stock = 0
   - "show product types" - Show breakdown by product type

5. BULK UPDATE STOCK
   Format: "bulk update stock: {pattern: value}"
   Example: "bulk update stock: all christmas products to 10"

When admin users ask to create, update, or delete products, respond with:
1. A confirmation of what you understood
2. A JSON block clearly marked with triple backticks containing the action details
3. A friendly explanation

Example response format for creating a product:
"I'll create a new product for you! Here's what I understood:

\`\`\`json
{
  "action": "create",
  "productData": {
    "name": "Spring Wreath",
    "price": 45.99,
    "description": "Beautiful spring wreath with silk flowers",
    "type": "decor",
    "stock": 3
  }
}
\`\`\`

This will add a new Spring Wreath to your inventory at $45.99 with 3 units in stock. Would you like me to proceed?"

For statistics requests, analyze the product data and provide clear summaries with numbers and insights.

IMPORTANT: Always include the JSON block with proper formatting when handling admin commands, as the system will parse and execute these automatically.`;

  return isAdmin ? basePrompt + adminPrompt : basePrompt;
}

/**
 * Check if user is admin based on request
 */
async function checkIsAdmin(req) {
  try {
    // Check for Firebase token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const parts = authHeader.split(' ');
      // Validate header format: must be exactly "Bearer <token>"
      if (parts.length !== 2 || !parts[1]) {
        logger.warn('Malformed Authorization header');
        return false;
      }
      const token = parts[1];
      const decoded = await admin.auth().verifyIdToken(token);
      return isAdminEmail(decoded.email);
    }
    
    // Check session-based auth (fallback)
    if (req.session && req.session.user && req.session.user.email) {
      return isAdminEmail(req.session.user.email);
    }
    
    return false;
  } catch (error) {
    logger.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Parse admin action from chatbot response
 */
function parseAdminAction(responseText) {
  try {
    // Look for JSON block in response (between triple backticks)
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      const actionData = JSON.parse(jsonMatch[1]);
      return actionData;
    }
    return null;
  } catch (error) {
    logger.error('Error parsing admin action:', error);
    return null;
  }
}

/**
 * Execute admin action
 */
async function executeAdminAction(actionData) {
  try {
    const { action, productData, productId, productName, updates } = actionData;
    
    switch (action) {
      case 'create':
        // Create new product
        if (!productData || !productData.name || productData.price === undefined) {
          return { success: false, error: 'Missing required fields: name and price' };
        }
        
        // Validate price
        const price = parseFloat(productData.price);
        if (isNaN(price) || price < 0) {
          return { success: false, error: 'Price must be a valid positive number' };
        }
        
        // Validate stock
        let stock = 1;
        if (productData.stock !== undefined) {
          stock = parseInt(productData.stock, 10);
          if (isNaN(stock) || stock < 0) {
            return { success: false, error: 'Stock must be a valid non-negative integer' };
          }
        }
        
        const newProduct = new Product({
          name: productData.name,
          description: productData.description || '',
          price: price,
          type: productData.type || 'decor',
          subcategory: productData.subcategory || '',
          stock: stock,
          options: productData.options || [],
          image: productData.image || '',
          images: productData.images || (productData.image ? [productData.image] : []),
          featured: productData.featured || false,
          collection: productData.collection || '',
          occasion: productData.occasion || ''
        });
        
        await newProduct.save();
        return { 
          success: true, 
          message: `Product "${newProduct.name}" created successfully with ID: ${newProduct._id}`,
          productId: newProduct._id,
          product: newProduct
        };
      
      case 'update':
        // Update existing product
        let productToUpdate;
        
        if (productId) {
          productToUpdate = await Product.findById(productId);
        } else if (productName) {
          // Use exact match first, then fallback to case-insensitive search
          productToUpdate = await Product.findOne({ name: productName });
          if (!productToUpdate) {
            productToUpdate = await Product.findOne({ name: { $regex: new RegExp(`^${productName}$`, 'i') } });
          }
        }
        
        if (!productToUpdate) {
          return { success: false, error: 'Product not found' };
        }
        
        // Validate and apply updates with type checking
        const allowedUpdates = ['name', 'description', 'price', 'type', 'subcategory', 'stock', 'options', 'image', 'images', 'featured', 'collection', 'occasion'];
        Object.keys(updates || {}).forEach(key => {
          if (!allowedUpdates.includes(key)) {
            return; // Skip unknown fields
          }
          
          const value = updates[key];
          
          // Type validation for specific fields
          if (key === 'price') {
            const priceVal = parseFloat(value);
            if (isNaN(priceVal) || priceVal < 0) {
              logger.warn(`Invalid price value in update: ${value}`);
              return;
            }
            productToUpdate[key] = priceVal;
          } else if (key === 'stock') {
            const stockVal = parseInt(value, 10);
            if (isNaN(stockVal) || stockVal < 0) {
              logger.warn(`Invalid stock value in update: ${value}`);
              return;
            }
            productToUpdate[key] = stockVal;
          } else if (key === 'type') {
            if (value !== 'decor' && value !== 'food') {
              logger.warn(`Invalid type value in update: ${value}`);
              return;
            }
            productToUpdate[key] = value;
          } else if (key === 'featured') {
            productToUpdate[key] = Boolean(value);
          } else if (key === 'options' || key === 'images') {
            if (!Array.isArray(value)) {
              logger.warn(`Invalid array value for ${key}: ${value}`);
              return;
            }
            productToUpdate[key] = value;
          } else if (typeof value === 'string' || value === '') {
            productToUpdate[key] = value;
          } else {
            logger.warn(`Invalid value type for ${key}: ${typeof value}`);
          }
        });
        
        await productToUpdate.save();
        return { 
          success: true, 
          message: `Product "${productToUpdate.name}" updated successfully`,
          product: productToUpdate
        };
      
      case 'delete':
        // Delete product
        let productToDelete;
        
        if (productId) {
          productToDelete = await Product.findByIdAndDelete(productId);
        } else if (productName) {
          productToDelete = await Product.findOneAndDelete({ name: { $regex: new RegExp(productName, 'i') } });
        }
        
        if (!productToDelete) {
          return { success: false, error: 'Product not found' };
        }
        
        return { 
          success: true, 
          message: `Product "${productToDelete.name}" deleted successfully`
        };
      
      case 'stats':
        // Get statistics
        const totalProducts = await Product.countDocuments();
        const decorProducts = await Product.countDocuments({ type: 'decor' });
        const foodProducts = await Product.countDocuments({ type: 'food' });
        const outOfStock = await Product.countDocuments({ stock: 0 });
        const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lt: 5 } });
        
        return {
          success: true,
          stats: {
            totalProducts,
            decorProducts,
            foodProducts,
            outOfStock,
            lowStock
          }
        };
      
      case 'low_stock':
        // Get low stock products
        const lowStockProducts = await Product.find({ stock: { $gt: 0, $lt: 5 } }).select('name stock');
        return {
          success: true,
          products: lowStockProducts
        };
      
      case 'out_of_stock':
        // Get out of stock products
        const outOfStockProducts = await Product.find({ stock: 0 }).select('name');
        return {
          success: true,
          products: outOfStockProducts
        };
      
      default:
        return { success: false, error: 'Unknown action' };
    }
  } catch (error) {
    logger.error('Error executing admin action:', error);
    return { success: false, error: error.message || 'Failed to execute action' };
  }
}

/**
 * Handle chatbot message
 * POST /api/chatbot/message
 */
exports.sendMessage = async (req, res) => {
  try {
    // Check if Gemini AI is initialized
    if (!genAI) {
      return res.status(503).json({ 
        error: 'Chatbot service is not available. Please contact support.',
        success: false
      });
    }
    
    const { message, chatHistory = [] } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Check if user is admin
    const isAdmin = await checkIsAdmin(req);
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Generate system prompt with current product context and admin mode if applicable
    const systemPrompt = await generateSystemPrompt(isAdmin);
    
    // Build chat history for context
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // Prepare initial acknowledgment based on user type
    const initialAcknowledgment = isAdmin
      ? 'I understand. I am a helpful customer service chatbot for Bonnie Lass Florals, and I will help customers with information about the handmade floral arrangements, crafts, and cottage food products. I will be warm, friendly, and provide accurate information based on the product data you\'ve shared. As you are an admin user, I can also help you manage products, update inventory, and view statistics using the admin commands.'
      : 'I understand. I am a helpful customer service chatbot for Bonnie Lass Florals, and I will help customers with information about the handmade floral arrangements, crafts, and cottage food products. I will be warm, friendly, and provide accurate information based on the product data you\'ve shared.';
    
    // Start chat with history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: initialAcknowledgment }]
        },
        ...formattedHistory
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });
    
    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = result.response;
    let text = response.text();
    
    // If admin, check for and execute admin actions
    let actionResult = null;
    if (isAdmin) {
      const actionData = parseAdminAction(text);
      if (actionData) {
        actionResult = await executeAdminAction(actionData);
        
        // Append action result to the response
        if (actionResult.success) {
          if (actionResult.stats) {
            text += `\n\n📊 **Statistics:**\n- Total Products: ${actionResult.stats.totalProducts}\n- Decor Products: ${actionResult.stats.decorProducts}\n- Food Products: ${actionResult.stats.foodProducts}\n- Out of Stock: ${actionResult.stats.outOfStock}\n- Low Stock (< 5): ${actionResult.stats.lowStock}`;
          } else if (actionResult.products) {
            text += `\n\n📋 **Products:**\n${actionResult.products.map(p => `- ${p.name}${p.stock !== undefined ? ` (Stock: ${p.stock})` : ''}`).join('\n')}`;
          } else {
            text += `\n\n✅ **Action completed:** ${actionResult.message}`;
          }
        } else {
          text += `\n\n❌ **Error:** ${actionResult.error}`;
        }
      }
    }
    
    logger.info('Chatbot response generated', { 
      messageLength: message.length, 
      responseLength: text.length,
      isAdmin,
      actionExecuted: !!actionResult
    });
    
    res.json({ 
      response: text,
      success: true,
      isAdmin,
      actionResult
    });
    
  } catch (error) {
    logger.error('Error in chatbot message handler:', error);
    
    // Handle specific Gemini API errors
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({ 
        error: 'Chatbot configuration error. Please contact support.',
        success: false
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate response. Please try again.',
      success: false
    });
  }
};

/**
 * Get chatbot status and basic info
 * GET /api/chatbot/status
 */
exports.getStatus = async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    
    res.json({
      status: genAI ? 'active' : 'unavailable',
      model: 'gemini-2.5-flash',
      configured: !!genAI,
      productCount,
      features: [
        'Product information',
        'Stock availability',
        'Pricing details',
        'Material information',
        'Collection filtering'
      ]
    });
  } catch (error) {
    logger.error('Error getting chatbot status:', error);
    res.status(500).json({ error: 'Failed to get chatbot status' });
  }
};
