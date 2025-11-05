const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const logger = require('../utils/logger');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBURtCjIIHKkAn--N8eoFQYrBCzxyR3vhg');

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
async function generateSystemPrompt() {
  const products = await getProductContext();
  
  const systemPrompt = `You are a friendly and knowledgeable customer service chatbot for Bonnie Lass Florals, a business specializing in handmade silk floral arrangements, wreaths, crafts, and cottage food products.

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

  return systemPrompt;
}

/**
 * Handle chatbot message
 * POST /api/chatbot/message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Generate system prompt with current product context
    const systemPrompt = await generateSystemPrompt();
    
    // Build chat history for context
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // Start chat with history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am a helpful customer service chatbot for Bonnie Lass Florals, and I will help customers with information about the handmade floral arrangements, crafts, and cottage food products. I will be warm, friendly, and provide accurate information based on the product data you\'ve shared.' }]
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
    const text = response.text();
    
    logger.info('Chatbot response generated', { messageLength: message.length, responseLength: text.length });
    
    res.json({ 
      response: text,
      success: true
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
      status: 'active',
      model: 'gemini-2.5-flash',
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
