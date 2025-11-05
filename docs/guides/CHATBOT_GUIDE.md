# Chatbot Implementation Guide

## Overview

This document describes the AI-powered chatbot implementation for Bonnie Lass Florals, built using Google's Gemini 2.5 Flash model.

## Features

### Core Capabilities
- **Product Information**: Answers questions about all products in the catalog
- **Stock Availability**: Provides real-time stock information
- **Pricing Details**: Accurate pricing from the database
- **Material Information**: Details about materials used in floral crafts
- **Collection Filtering**: Helps customers find products by collection (Christmas, Fall, Easter, etc.) or occasion (Wedding, Birthday, etc.)
- **Options & Variants**: Information about product options (sizes, variations)

### Technical Features
- **Context-Aware**: Maintains conversation history for natural dialogue
- **Real-Time Data**: Pulls current product information from MongoDB
- **Rate Limited**: Protected against abuse (20 requests per minute)
- **Input Validation**: Sanitized and validated user input
- **Error Handling**: Graceful error handling with user-friendly messages
- **XSS Protection**: HTML escaping to prevent cross-site scripting

## Architecture

### Backend Components

#### 1. Chatbot Controller (`backend/controllers/chatbotController.js`)

**Main Functions:**
- `getProductContext()`: Fetches all products from database and formats them for the AI
- `generateSystemPrompt()`: Creates a context-rich system prompt with product data
- `sendMessage(req, res)`: Handles incoming chat messages and returns AI responses
- `getStatus(req, res)`: Returns chatbot status and capabilities

**System Prompt:**
The chatbot is configured with:
- Business information (Bonnie Lass Florals specializes in handmade silk florals and cottage foods)
- Current product catalog with all available details
- Guidelines for handling different product types
- Instructions to be helpful, warm, and honest

#### 2. Chatbot Routes (`backend/routes/chatbot.js`)

**Endpoints:**
- `POST /api/chatbot/message`: Send a message and receive a response
  - Request body: `{ message: string, chatHistory?: array }`
  - Response: `{ response: string, success: boolean }`
- `GET /api/chatbot/status`: Get chatbot information
  - Response: `{ status: string, model: string, productCount: number, features: array }`

**Security:**
- Rate limiting: 20 requests per minute per IP
- Input validation: 1000 character limit on messages
- Sanitization: Trimmed and validated inputs

### Frontend Components

#### 1. Chatbot Widget (`public/chatbot.js`)

**UI Elements:**
- **Toggle Button**: Floating button with logo (bottom-right corner)
- **Chat Window**: Modal-style interface with header, messages area, and input
- **Messages Area**: Displays conversation with user/assistant distinction
- **Input Field**: Auto-resizing textarea with send button
- **Loading Indicator**: Animated dots while waiting for response

**Styling:**
- Responsive design (mobile-optimized)
- Gradient purple theme matching site branding
- Smooth animations and transitions
- Logo prominently displayed

**User Experience:**
- Enter to send (Shift+Enter for new line)
- Auto-scroll to latest message
- Loading states during API calls
- Error messages for failed requests
- Welcome message on first open

## Configuration

### Environment Variables

The chatbot requires the Gemini API key to be set as an environment variable:

```bash
# In your .env file
GEMINI_API_KEY=your-gemini-api-key-here
```

**Security Note:** Never commit API keys to version control. The chatbot controller will throw an error on startup if the `GEMINI_API_KEY` environment variable is not set.

To obtain a Gemini API key:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### Model Configuration

```javascript
{
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,    // Balanced creativity/accuracy
    topP: 0.8,           // Nucleus sampling parameter
    topK: 40,            // Top-k sampling parameter
    maxOutputTokens: 1024 // Max response length
  }
}
```

## Integration

### Adding to Pages

The chatbot is integrated into the following pages:
- `index.html` (Home)
- `shop.html` (Shop)
- `about.html` (About)
- `gallery.html` (Gallery)
- `contact.html` (Contact)

To add to a new page, include the script before `</body>`:

```html
<script src="chatbot.js"></script>
```

### Backend Route Registration

In `backend/index.js`:

```javascript
logger.info('Loading router: /api/chatbot');
app.use('/api/chatbot', require('./routes/chatbot'));
```

## Product Information

The chatbot has access to the following product fields:

- **name**: Product name
- **description**: Product description
- **price**: Price in USD
- **type**: Product type (decor, food)
- **subcategory**: Product subcategory (craft, wreath, preserve, etc.)
- **stock**: Number of items in stock
- **options**: Available options/variants (sizes, colors, etc.)
- **collection**: Seasonal collection (christmas, fall, easter, etc.)
- **occasion**: Suitable occasions (wedding, birthday, etc.)

## Usage Examples

### Customer Queries

1. **Product Search:**
   - "Do you have any Christmas wreaths?"
   - "What cottage food products are available?"

2. **Pricing:**
   - "How much is the Rooster Wreath?"
   - "What's your price range for floral arrangements?"

3. **Stock Availability:**
   - "Is the blue centerpiece in stock?"
   - "Do you have any Easter products available?"

4. **Details:**
   - "What materials are used in your wreaths?"
   - "Tell me about your preserves"

5. **Collections:**
   - "Show me fall-themed items"
   - "What do you have for weddings?"

## Customization

### Modifying the System Prompt

To adjust the chatbot's personality or knowledge, edit `generateSystemPrompt()` in `backend/controllers/chatbotController.js`.

### Styling

All chatbot styles are embedded in `public/chatbot.js`. Key CSS classes:
- `.chatbot-toggle`: Floating button
- `.chatbot-window`: Main chat interface
- `.chatbot-message`: Individual message bubbles
- `.chatbot-input`: Text input area

Colors can be adjusted in the gradient definitions:
```css
background: linear-gradient(135deg, #d946ef 0%, #a855f7 100%);
```

### Rate Limits

Adjust rate limiting in `backend/routes/chatbot.js`:

```javascript
const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // requests per window
  // ...
});
```

## Security Considerations

1. **API Key Protection**: Store the Gemini API key in environment variables
2. **Rate Limiting**: Prevents abuse and controls API costs
3. **Input Validation**: All inputs are validated and sanitized
4. **XSS Prevention**: HTML is escaped before rendering
5. **Error Handling**: Sensitive error details are not exposed to users

## Limitations

1. **Product Data**: The chatbot only knows about products in the database. It cannot:
   - Access detailed ingredient lists not in the database
   - Provide pH levels unless explicitly stored in product data
   - Make up information about materials or ingredients

2. **Training Data**: The chatbot is not "trained" in the traditional sense - it receives product data as context with each request

3. **Conversation Length**: Very long conversations may hit context limits (though chat history is maintained)

## Future Enhancements

Potential improvements for the chatbot:

1. **Enhanced Product Data**:
   - Add ingredient lists for cottage foods
   - Include pH levels for relevant products
   - Add detailed material descriptions for crafts

2. **Additional Features**:
   - Order status checking
   - Custom order inquiries
   - Image recognition (identify products from photos)
   - Multi-language support

3. **Analytics**:
   - Track common questions
   - Identify product interest trends
   - Measure customer satisfaction

4. **Integration**:
   - Direct "Add to Cart" from chat
   - Product recommendations based on conversation
   - Customer support ticket creation

## Testing

Run the test suite to verify chatbot functionality:

```bash
npm test
```

The test suite (`test/chatbot.test.js`) verifies:
- Backend routes and controller
- Frontend widget integration
- Security features
- UI/UX components
- Error handling
- Page integration

## Support

For issues or questions about the chatbot:
1. Check the browser console for JavaScript errors
2. Verify the backend is running and accessible
3. Check that the Gemini API key is valid
4. Review rate limit status if requests are failing
5. Examine backend logs for detailed error information

## API Cost Considerations

The Gemini API is used on a pay-per-use basis. Monitor usage to control costs:
- Rate limiting helps prevent excessive API calls
- Each conversation message = 1 API call
- Product context is sent with each request (affects token usage)
- Consider caching common responses for frequently asked questions

## Changelog

### Version 1.0 (Initial Implementation)
- Google Gemini 2.5 Flash integration
- Product catalog integration
- Responsive chat widget
- Rate limiting and security features
- Comprehensive test coverage
- Multi-page integration
