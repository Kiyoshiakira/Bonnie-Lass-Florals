# Gemini 3 Migration Guide

## Current Status

The application currently uses `@google/generative-ai` v0.24.1, which is **deprecated** and only supports models up to Gemini 2.5 Flash.

**Current Model**: `gemini-2.5-flash`

## Why Migrate to Gemini 3?

Gemini 3 offers:
- **Better Performance**: Improved reasoning and response quality
- **Lower Latency**: Faster response times
- **Cost Efficiency**: Better pricing for equivalent quality
- **Advanced Features**: Enhanced multimodal support, streaming function calling, adjustable reasoning depth
- **Future Support**: Active development and new features

## Migration Steps

### 1. Update Package Dependencies

Replace the deprecated package:

```bash
npm uninstall @google/generative-ai
npm install @google/genai@latest
```

Update `package.json`:
```json
{
  "dependencies": {
    "@google/genai": "^1.27.0",
    // Remove: "@google/generative-ai": "^0.24.1"
  }
}
```

### 2. Update Chatbot Controller

File: `backend/controllers/chatbotController.js`

#### Old Code (Current):
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
} catch (error) {
  logger.error('Failed to initialize Gemini AI:', error);
}

// Later in the code:
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
```

#### New Code (Gemini 3):
```javascript
const { GoogleGenAI } = require('@google/genai');

let genAI = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    genAI = new GoogleGenAI({ apiKey });
  }
} catch (error) {
  logger.error('Failed to initialize Gemini AI:', error);
}

// Later in the code:
const model = genAI.getGenerativeModel({ 
  model: 'gemini-3-flash-preview',
  generationConfig: {
    temperature: 0.9,
    topP: 0.95,
    topK: 50,
    maxOutputTokens: 2048,
    // Gemini 3 specific parameters:
    thinkingLevel: 'medium', // Options: 'minimal', 'low', 'medium', 'high'
    mediaResolution: 'auto'  // Options: 'low', 'medium', 'high', 'ultra'
  }
});
```

### 3. Update Status Endpoint

Change the model name in the status response:

```javascript
res.json({
  status: genAI ? 'active' : 'unavailable',
  model: 'gemini-3-flash-preview', // Updated from gemini-2.5-flash
  configured: !!genAI,
  // ... rest of the response
});
```

### 4. Test the Migration

1. **Set up environment**:
   ```bash
   # Ensure GEMINI_API_KEY is set
   echo $GEMINI_API_KEY
   ```

2. **Test basic functionality**:
   ```bash
   npm start
   # Test chatbot endpoint
   curl -X POST http://localhost:5000/api/chatbot/message \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, can you help me?"}'
   ```

3. **Test admin features**:
   - Log in as admin
   - Try product management commands
   - Verify AI understands natural language commands

4. **Monitor error logs**:
   ```bash
   tail -f logs/app.log
   ```

### 5. Update Documentation

- Update README.md with new SDK information
- Update CHATBOT_GUIDE.md with Gemini 3 features
- Update API documentation if applicable

## Gemini 3 Features to Leverage

### 1. Thinking Level Control

Control the depth of reasoning:

```javascript
generationConfig: {
  thinkingLevel: 'high' // For complex admin tasks
}

// or

generationConfig: {
  thinkingLevel: 'low' // For simple customer queries
}
```

### 2. Streaming Function Calling

For more responsive admin actions:

```javascript
const stream = await model.generateContentStream({
  contents: message,
  tools: adminTools // Your product management functions
});

for await (const chunk of stream) {
  // Handle partial responses
}
```

### 3. Enhanced Multimodal Support

Better image understanding for product photos:

```javascript
const result = await model.generateContent([
  { text: "Describe this product image" },
  { 
    inlineData: {
      mimeType: "image/jpeg",
      data: imageBase64
    }
  }
]);
```

## Rollback Plan

If issues occur, rollback steps:

1. **Reinstall old package**:
   ```bash
   npm uninstall @google/genai
   npm install @google/generative-ai@0.24.1
   ```

2. **Revert code changes**:
   ```bash
   git revert <migration-commit-hash>
   ```

3. **Restart application**:
   ```bash
   npm start
   ```

## Testing Checklist

- [ ] Basic chatbot responses work
- [ ] Admin authentication works
- [ ] Product creation commands work
- [ ] Product update commands work
- [ ] Photo management works
- [ ] Bulk operations work
- [ ] Error handling works properly
- [ ] Rate limiting still functions
- [ ] Performance is acceptable
- [ ] No regression in existing features

## Resources

- [Google Gen AI SDK Documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/sdks/overview)
- [Gemini 3 Developer Guide](https://ai.google.dev/gemini-api/docs/gemini-3)
- [Gemini 3 Flash Documentation](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-flash)
- [Migration Guide from Legacy SDK](https://cloud.google.com/vertex-ai/generative-ai/docs/migrate)

## Support

If you encounter issues during migration:

1. Check the error logs for specific API errors
2. Verify API key is still valid
3. Ensure billing is enabled on Google Cloud
4. Consult the official documentation
5. Test with a simple example first before deploying to production
