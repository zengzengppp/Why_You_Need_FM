# Deployment Instructions

## Netlify Configuration

### 1. Environment Variables Setup

The application requires the following environment variable to be set in your Netlify dashboard:

#### Required Environment Variables:
- `GOOGLE_API_KEY`: Your Google Gemini API key

#### How to Add Environment Variables in Netlify:

1. **Go to your Netlify Dashboard**
   - Navigate to https://app.netlify.com/
   - Select your site

2. **Access Site Settings**
   - Click on "Site configuration" 
   - Go to "Environment variables" section

3. **Add the Environment Variable**
   - Click "Add a variable"
   - Key: `GOOGLE_API_KEY`
   - Value: Your actual Google Gemini API key (starts with `AIza...`)
   - Click "Create variable"

4. **Redeploy the Site**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Clear cache and deploy site"

### 2. Getting a Google Gemini API Key

1. Visit: https://ai.google.dev/
2. Click "Get API key"
3. Create a new project or select existing one
4. Generate an API key
5. Copy the key (format: `AIzaSy...`)

### 3. Testing the Configuration

#### Test Environment Variables:
Visit your deployed site at: `https://your-site.netlify.app/api/test-env`

This will show you:
- Whether the API key is configured
- Environment information
- API key status (without exposing the actual key)

#### Test LLM Functionality:
1. Visit your deployed site
2. Enter a company name and submit
3. Check browser console for detailed logs
4. If using fallback content, check the environment variable configuration

### 4. Troubleshooting

#### Problem: API returns fallback content
**Solution:**
1. Check `/api/test-env` endpoint
2. Verify GOOGLE_API_KEY is set in Netlify environment variables
3. Check build logs for any errors
4. Ensure the API key is valid and has proper permissions

#### Problem: Build failures
**Solution:**
1. Check build logs in Netlify dashboard
2. Verify all dependencies are properly installed
3. Check if TypeScript/ESLint errors are properly ignored

#### Problem: API timeout errors
**Solution:**
1. Check Netlify function logs
2. Verify the Google API is accessible from Netlify's servers
3. Check for rate limiting issues

### 5. Local vs Production

**Local Development (.env.local):**
```
GOOGLE_API_KEY=your-key-here
```

**Production (Netlify Environment Variables):**
- Set via Netlify dashboard
- Not stored in code repository
- Automatically available to serverless functions

### 6. Security Notes

- ✅ **DO**: Set environment variables in Netlify dashboard
- ✅ **DO**: Keep API keys secure and rotate them regularly
- ❌ **DON'T**: Commit API keys to the repository
- ❌ **DON'T**: Use client-side environment variables for API keys
- ❌ **DON'T**: Share API keys in chat/email

### 7. Monitoring

The application includes detailed logging for debugging:
- Environment variable status
- API call timing
- Error details
- Fallback usage

Check browser console and Netlify function logs for debugging information.