# AI Chatbot Troubleshooting Guide

This guide provides detailed troubleshooting steps for the AI chatbot, with specific instructions for Render.com hosting.

## Table of Contents

1. [Common Issues and Solutions](#common-issues-and-solutions)
2. [Render.com Specific Setup](#rendercom-specific-setup)
3. [Debugging Steps](#debugging-steps)
4. [Error Messages](#error-messages)
5. [API Key Issues](#api-key-issues)
6. [Network and CORS Issues](#network-and-cors-issues)

---

## Common Issues and Solutions

### Issue: Chatbot shows "Service Unavailable" (503 Error)

**Symptoms:**
- Chatbot button appears but clicking it shows service unavailable
- Error message: "The chatbot service is temporarily unavailable"
- Backend logs show: "GEMINI_API_KEY environment variable is not set"

**Root Cause:** The Gemini API key is not configured in your environment.

**Solution:**

1. **For Render.com:**
   - Go to your Render dashboard: https://dashboard.render.com
   - Select your backend service
   - Click on "Environment" in the left sidebar
   - Add a new environment variable:
     - **Key:** `GEMINI_API_KEY`
     - **Value:** Your Gemini API key (from https://makersuite.google.com/app/apikey)
   - Click "Save Changes"
   - Render will automatically redeploy your service

2. **Verify the API Key:**
   - Ensure there are no extra spaces before or after the key
   - The key should start with `AIza...`
   - Make sure you copied the entire key

3. **Wait for Deployment:**
   - After adding the environment variable, wait 2-3 minutes for Render to redeploy
   - Check the deployment logs in Render dashboard
   - Look for: "Gemini AI initialized successfully"

### Issue: Chatbot Not Responding / Connection Timeout

**Symptoms:**
- Loading indicator keeps spinning
- No response after sending a message
- Connection status shows warning

**Possible Causes & Solutions:**

1. **Backend Service is Asleep (Render Free Tier)**
   - Render's free tier spins down services after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds to wake up
   - **Solution:** Wait up to 60 seconds for the first response, or upgrade to a paid plan

2. **Network/Firewall Issues**
   - Check if you can access the backend URL directly
   - Visit: `https://bonnie-lass-florals.onrender.com/api/chatbot/status`
   - Should return JSON with chatbot status
   - **Solution:** If this fails, check your firewall or network settings

3. **CORS Configuration**
   - Frontend domain not in allowed origins
   - **Solution:** Add your domain to `CLIENT_ORIGINS` environment variable in Render:
     ```
     CLIENT_ORIGINS=https://bonnielassflorals.com,https://www.bonnielassflorals.com
     ```

### Issue: Rate Limit Exceeded (429 Error)

**Symptoms:**
- Error message: "Too many requests"
- Happens after sending several messages quickly

**Solution:**
- Wait 60 seconds before trying again
- Default limit is 20 requests per minute
- To adjust, modify `backend/routes/chatbot.js` line 10:
  ```javascript
  max: 20, // Increase this number if needed
  ```

### Issue: Chatbot Gives Generic/Unhelpful Responses

**Symptoms:**
- Chatbot doesn't know about your products
- Responses are generic, not specific to your inventory

**Root Cause:** Database connection issue or no products in database.

**Solution:**

1. **Check MongoDB Connection:**
   - Verify `MONGO_URI` environment variable is set in Render
   - Check Render logs for "MongoDB connected"
   - If you see connection errors, verify your MongoDB Atlas credentials

2. **Verify Products Exist:**
   - Access MongoDB Atlas dashboard
   - Check if the `products` collection has data
   - If empty, you need to upload products via the admin panel

3. **Test Product Context:**
   - Visit: `https://bonnie-lass-florals.onrender.com/api/chatbot/status`
   - Check `productCount` in the response
   - If it's 0, you need to add products

---

## Render.com Specific Setup

### Step-by-Step Configuration on Render

1. **Access Environment Variables:**
   ```
   Dashboard → Your Service → Environment (left sidebar)
   ```

2. **Required Environment Variables:**
   ```
   GEMINI_API_KEY=AIza...your-api-key-here
   MONGO_URI=mongodb+srv://...your-mongodb-connection
   SESSION_SECRET=random-secret-string-here
   CLIENT_ORIGINS=https://bonnielassflorals.com
   NODE_ENV=production
   ```

3. **After Adding Variables:**
   - Click "Save Changes"
   - Render automatically triggers a new deployment
   - Wait for deployment to complete (check "Events" tab)
   - Look for "Live" status

### Viewing Logs on Render

1. **Access Logs:**
   ```
   Dashboard → Your Service → Logs (left sidebar)
   ```

2. **What to Look For:**
   - ✅ "Gemini AI initialized successfully"
   - ✅ "MongoDB connected"
   - ✅ "Server running on port 10000" (or your port)
   - ❌ "GEMINI_API_KEY environment variable is not set"
   - ❌ "MongoDB connection error"

3. **Real-time Monitoring:**
   - Keep logs open while testing
   - Send a test message from the chatbot
   - Watch for any error messages

### Troubleshooting Render Deployments

**Issue: Deployment Failing**

Check build logs for errors:
```
Dashboard → Your Service → Events → Click on failed deployment
```

Common deployment issues:
- Missing `package.json` dependencies
- Build timeout (increase in service settings)
- Out of memory (upgrade plan or optimize)

**Issue: Service Keeps Restarting**

1. Check for:
   - Uncaught exceptions in code
   - Memory leaks
   - Missing environment variables causing crashes

2. Review logs for crash patterns:
   - Look for repeating error messages
   - Check timestamp of crashes

---

## Debugging Steps

### Step 1: Verify Backend is Running

Test the health endpoint:
```bash
curl https://bonnie-lass-florals.onrender.com/api/chatbot/status
```

Expected response:
```json
{
  "status": "active",
  "model": "gemini-2.5-flash",
  "configured": true,
  "productCount": 15,
  "features": [...]
}
```

If you get:
- `status: "unavailable"` → API key not set
- `configured: false` → API key not set
- `productCount: 0` → Database empty or connection issue
- Connection timeout → Backend is down or sleeping

### Step 2: Test the Chat Endpoint Directly

```bash
curl -X POST https://bonnie-lass-florals.onrender.com/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what products do you have?"}'
```

Expected response:
```json
{
  "success": true,
  "response": "Hi there! I'd be happy to help you explore our products..."
}
```

Error responses:
- `503`: API key not configured
- `400`: Invalid request format
- `429`: Rate limit exceeded
- `500`: Server error (check logs)

### Step 3: Check Browser Console

1. Open browser developer tools (F12)
2. Go to Console tab
3. Reload page with chatbot
4. Look for errors:
   - CORS errors → Check `CLIENT_ORIGINS`
   - Network errors → Backend not accessible
   - JavaScript errors → Frontend code issue

### Step 4: Check Network Tab

1. Open browser developer tools (F12)
2. Go to Network tab
3. Click chatbot and send a message
4. Look for the `/api/chatbot/message` request
5. Check:
   - Status code (should be 200)
   - Response time
   - Response body

---

## Error Messages

### Frontend Error Messages

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| "Service temporarily unavailable" | API key not set | Configure GEMINI_API_KEY in Render |
| "Too many requests" | Rate limit hit | Wait 60 seconds |
| "Unable to connect" | Network issue | Check internet, backend status |
| "Server error" | Backend crashed | Check Render logs |
| "Invalid request" | Bad request format | Contact support |

### Backend Log Messages

| Log Message | Meaning | Action Needed |
|------------|---------|---------------|
| "GEMINI_API_KEY environment variable is not set" | Missing API key | Add in Render environment |
| "Failed to initialize Gemini AI" | Invalid API key | Check key is correct |
| "MongoDB connection error" | Database issue | Verify MONGO_URI |
| "Chatbot response generated" | Success ✅ | No action needed |

---

## API Key Issues

### Getting a Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Select or create a Google Cloud project
5. Copy the generated key (starts with `AIza...`)

### Validating Your API Key

Test your key with curl:
```bash
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

If the key is valid, you'll get a response. If invalid:
```json
{
  "error": {
    "code": 400,
    "message": "API key not valid"
  }
}
```

### API Key Best Practices

1. **Never commit to Git:**
   - Keys should only be in environment variables
   - Check `.env` is in `.gitignore`

2. **Rotate regularly:**
   - Generate new keys every 90 days
   - Delete old keys after rotation

3. **Monitor usage:**
   - Visit Google Cloud Console
   - Set up billing alerts
   - Check for unexpected usage

4. **Restrict the key (recommended):**
   - In Google Cloud Console → Credentials
   - Click your API key
   - Add restrictions:
     - API restrictions: Only allow Generative Language API
     - Application restrictions: HTTP referrers (optional)

---

## Network and CORS Issues

### CORS Configuration

If frontend can't connect to backend, check CORS settings.

**In Render Environment Variables:**
```
CLIENT_ORIGINS=https://bonnielassflorals.com,https://www.bonnielassflorals.com
```

**For local development:**
```
CLIENT_ORIGINS=http://localhost:3000,http://localhost:5000
```

**Testing CORS:**
```bash
curl -H "Origin: https://bonnielassflorals.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://bonnie-lass-florals.onrender.com/api/chatbot/message
```

Should return CORS headers in response.

### Firewall Issues

If hosted behind a firewall:
1. Whitelist Google AI API endpoints:
   - `generativelanguage.googleapis.com`
   - Port 443 (HTTPS)

2. Allow outbound connections to:
   - MongoDB Atlas (if using)
   - Google AI services

---

## Quick Checklist

Before seeking further help, verify:

- [ ] `GEMINI_API_KEY` is set in Render environment variables
- [ ] API key is valid (test with curl)
- [ ] Backend service is "Live" on Render
- [ ] Logs show "Gemini AI initialized successfully"
- [ ] Logs show "MongoDB connected"
- [ ] `CLIENT_ORIGINS` includes your frontend domain
- [ ] Status endpoint returns `"status": "active"`
- [ ] No CORS errors in browser console
- [ ] Products exist in database (`productCount > 0`)

---

## Still Having Issues?

### Collect Debug Information

1. **Backend Status Response:**
   ```bash
   curl https://bonnie-lass-florals.onrender.com/api/chatbot/status
   ```

2. **Recent Render Logs:**
   - Copy last 50 lines from Render dashboard

3. **Browser Console Errors:**
   - Screenshot any errors in browser console

4. **Environment Variables:**
   - Confirm which variables are set (don't share the actual values)

### Contact Support

Include:
- Description of the issue
- Debug information from above
- Steps you've already tried
- When the issue started

---

## Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Render.com Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Chatbot Setup Guide](./CHATBOT_SETUP.md)
- [Chatbot Implementation Guide](./CHATBOT_GUIDE.md)
