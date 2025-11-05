# Chatbot Setup Instructions

This guide will help you configure the AI chatbot for Bonnie Lass Florals.

## Prerequisites

1. A Google Cloud account
2. Access to the Google AI Studio
3. Node.js environment set up

## Step 1: Obtain Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Select your Google Cloud project (or create a new one)
5. Copy the generated API key

**Important:** Keep this API key secure and never commit it to version control.

## Step 2: Configure Environment Variables

1. In the root directory of the project, create a `.env` file (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and add your Gemini API key:
   ```bash
   GEMINI_API_KEY=your-actual-api-key-here
   ```

3. Verify other required environment variables are set:
   - `MONGO_URI`: Your MongoDB connection string
   - `SESSION_SECRET`: A random secret for session encryption
   - `CLIENT_ORIGINS`: Allowed CORS origins

## Step 3: Install Dependencies

If you haven't already installed dependencies:

```bash
npm install
```

This will install the `@google/generative-ai` package along with other dependencies.

## Step 4: Verify Installation

1. Start the backend server:
   ```bash
   npm start
   ```

2. Check the console logs for:
   ```
   Gemini AI initialized successfully
   ```

3. Test the chatbot status endpoint:
   ```bash
   curl http://localhost:5000/api/chatbot/status
   ```

   You should see a response like:
   ```json
   {
     "status": "active",
     "model": "gemini-2.5-flash",
     "configured": true,
     "productCount": 10,
     "features": [...]
   }
   ```

## Step 5: Test the Chatbot

1. Open your browser and navigate to your site (e.g., `http://localhost:5000`)
2. Look for the chatbot button in the bottom-right corner (purple circle with logo)
3. Click the button to open the chat window
4. Send a test message like "What products do you have?"
5. You should receive a response from the AI chatbot

## Troubleshooting

### Chatbot shows "unavailable" status

**Cause:** The `GEMINI_API_KEY` is not set or is invalid.

**Solution:**
1. Verify the API key is correctly set in your `.env` file
2. Make sure there are no extra spaces or quotes around the key
3. Check that the API key is valid in Google AI Studio
4. Restart the backend server after updating the `.env` file

### "Too many requests" error

**Cause:** You've hit the rate limit (20 requests per minute).

**Solution:**
1. Wait a minute before trying again
2. If you need higher limits, adjust the rate limiter in `backend/routes/chatbot.js`

### Chatbot not responding

**Possible causes and solutions:**

1. **Backend not running:**
   - Start the backend with `npm start`
   - Check console for errors

2. **API key quota exceeded:**
   - Check your Google Cloud billing and quotas
   - Verify you haven't exceeded free tier limits

3. **Network connectivity:**
   - Ensure your server can reach Google's API endpoints
   - Check firewall settings

4. **CORS issues:**
   - Verify `CLIENT_ORIGINS` in `.env` includes your frontend domain
   - Check browser console for CORS errors

### Chatbot gives generic responses

**Cause:** The product database might be empty or the chatbot can't access it.

**Solution:**
1. Verify MongoDB is connected
2. Check that products exist in the database
3. Review backend logs for database connection errors

## API Usage and Billing

The Gemini API operates on a pay-as-you-go model:

- **Free Tier:** Includes a generous number of free requests per month
- **Pricing:** After free tier, you pay per 1000 characters of input/output
- **Rate Limits:** Default limits help control costs

To monitor usage:
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Go to APIs & Services → Dashboard
3. Select Generative Language API
4. View quota and usage statistics

## Security Best Practices

1. **Never commit `.env` files:** The `.env` file is in `.gitignore` to prevent accidental commits
2. **Rotate API keys regularly:** Generate new API keys periodically
3. **Monitor usage:** Set up billing alerts in Google Cloud
4. **Use environment-specific keys:** Use different API keys for development and production
5. **Restrict API key:** In Google Cloud Console, you can restrict API keys by:
   - IP address
   - HTTP referrer
   - Application

## Production Deployment

For production deployment:

1. Set environment variables in your hosting platform (not in `.env` file):
   - Heroku: Use `heroku config:set GEMINI_API_KEY=xxx`
   - Vercel/Netlify: Set in environment variables dashboard
   - Docker: Use secrets or environment files

2. Enable monitoring and logging:
   - Set up error tracking (e.g., Sentry)
   - Monitor API usage in Google Cloud
   - Set up billing alerts

3. Configure rate limiting appropriately:
   - Adjust limits based on expected traffic
   - Consider implementing per-user rate limits

4. Test thoroughly:
   - Verify chatbot works in production environment
   - Test with various product queries
   - Check error handling

## Support

If you encounter issues:

1. Check the [Chatbot Guide](./CHATBOT_GUIDE.md) for detailed documentation
2. Review backend logs for error messages
3. Test the API endpoint directly with curl or Postman
4. Verify all environment variables are correctly set
5. Check Google AI Studio for API key status and quotas

## References

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Chatbot Implementation Guide](./CHATBOT_GUIDE.md)
