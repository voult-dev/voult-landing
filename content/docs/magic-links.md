# Magic Link Authentication Implementation Guide

This guide explains how to use the magic link authentication feature to authenticate users into their apps using the developer's own redirect URI.

## Overview

The magic link system allows users to authenticate by clicking a link sent to their email. The link redirects to the **developer's app URL**, and the developer's frontend then exchanges the token for JWT authentication tokens.

## How It Works

1. **Developer sends magic link request** with user email, clientId, and their app's redirect URI
2. **System generates a secure token** and stores it in the database
3. **Email is sent** with a link to the developer's redirect URI (including the token)
4. **User clicks the link** and is redirected to the developer's app
5. **Developer's frontend extracts the token** from the URL
6. **Developer's frontend calls `/api/validate-magic-link`** with the token
7. **System validates token**, finds the user, generates JWT tokens, and returns them
8. **Developer's app stores tokens** and logs the user in

## API Endpoints

### 1. Send Magic Link

**POST** `/api/send-magic-link`

**Request Body:**
```json
{
  "email": "user@example.com",
  "clientId": "app_abc123def456",
  "redirectUri": "https://developer-app.com/auth/callback"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Magic link sent successfully. Please check your email."
}
```

**Response (Error - Missing redirectUri):**
```json
{
  "success": false,
  "message": "Redirect URI (developer app URL) is required"
}
```

### 2. Validate Magic Link Token

**POST** `/api/validate-magic-link`

**Request Body:**
```json
{
  "token": "abc123...xyz789"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "60d5ecb5c9c7a7001f3e4b5a",
      "email": "user@example.com",
      "fullName": "John Doe",
      "isEmailVerified": true
    }
  }
}
```

**Response (Error - User Not Found):**
```json
{
  "success": false,
  "message": "No account found with this email. Please register first."
}
```

**Response (Error - Invalid/Expired Token):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

## Database Schema

### MagicLinkToken Model

```javascript
{
  email: String,           // User's email
  app: ObjectId,           // Reference to App
  tokenHash: String,       // Hashed token (not returned)
  expiresAt: Date,         // Token expiration (10 minutes)
  used: Boolean,           // Whether token has been used
  usedAt: Date,            // When token was used
  redirectUri: String,     // Developer's app URL
  createdAt: Date,         // When token was created
  updatedAt: Date          // Last update
}
```

## Implementation Details

### Token Generation & Storage

- Tokens are 32-byte random hex strings (256-bit security)
- Tokens are hashed using SHA-256 before storage
- Tokens expire after 10 minutes
- Expired tokens are automatically deleted on access attempt
- Tokens can only be used once

### Email Content

The email contains a link to the **developer's redirect URI** with the token as a query parameter:

```
https://developer-app.com/auth/callback?token=abc123...xyz789
```

### User Authentication Flow

1. When `validateToken` is called:
   - Token is validated (exists, not expired, not used)
   - User is looked up by email + app
   - If user not found, returns 404 error
   - Token is marked as used
   - User's `lastLoginAt` is updated
   - User's `isEmailVerified` is set to true
   - JWT access and refresh tokens are generated
   - Tokens are returned to the caller

## Frontend Integration Example

Here's how a developer would integrate magic link authentication into their app:

```javascript
// 1. Request magic link (from developer's login page)
async function requestMagicLink(email) {
  const response = await fetch('https://voult.dev/api/send-magic-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      clientId: 'app_abc123def456',
      redirectUri: 'https://myapp.com/auth/callback'
    })
  });
  return await response.json();
}

// 2. Handle magic link callback (at /auth/callback route)
function handleMagicLinkCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (!token) {
    // No token in URL, redirect to login
    window.location.href = '/login';
    return;
  }
  
  // Clear the URL
  window.history.replaceState({}, document.title, '/auth/callback');
  
  // Validate token and get JWTs
  validateMagicLink(token);
}

// 3. Validate token and login
async function validateMagicLink(token) {
  try {
    const response = await fetch('https://voult.dev/api/validate-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store tokens securely
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Set up authorization header for future requests
      setupAuthHeader(data.data.accessToken);
      
      // Redirect to dashboard or intended destination
      window.location.href = '/dashboard';
    } else {
      // Show error
      alert(data.message);
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Magic link validation error:', error);
    alert('Authentication failed. Please try again.');
    window.location.href = '/login';
  }
}

// 4. Helper to set up auth header
function setupAuthHeader(accessToken) {
  // This would be called before each API request
  // Example: axios.interceptors.request.use(config => {
  //   config.headers.Authorization = `Bearer ${accessToken}`;
  //   return config;
  // });
}

// Initialize on page load
if (window.location.pathname === '/auth/callback') {
  handleMagicLinkCallback();
}
```

## Testing

### Test Request Magic Link

```bash
curl -X POST http://localhost:3000/api/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "clientId": "app_abc123def456",
    "redirectUri": "https://myapp.com/auth/callback"
  }'
```

### Test Validate Token

```bash
curl -X POST http://localhost:3000/api/validate-magic-link \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123...xyz789"
  }'
```

## Security Considerations

1. **Token Expiration**: Tokens expire after 10 minutes
2. **One-Time Use**: Tokens are marked as used after validation
3. **HTTPS Only**: Always use HTTPS for magic links in production
4. **Rate Limiting**: Implement rate limiting on the send-magic-link endpoint
5. **User Existence**: The system only works for existing users (no auto-registration)
6. **Redirect URI Validation**: The redirectUri must be a valid URL
7. **Token Hashing**: Tokens are hashed before storage for security

## Error Handling

| Error | HTTP Status | Description |
|-------|-------------|-------------|
| Missing email | 400 | Email address is required |
| Invalid email | 400 | Email format is invalid |
| Missing clientId | 400 | Client ID is required |
| Missing redirectUri | 400 | Redirect URI is required |
| Invalid redirectUri | 400 | Redirect URI must be a valid URL |
| App not found | 404 | App with given clientId doesn't exist |
| App inactive | 404 | App has been deactivated |
| User not found | 404 | No account with this email exists |
| Invalid token | 400 | Token doesn't exist or is invalid |
| Expired token | 400 | Token has expired |
| Token already used | 400 | Token has already been used |

## Best Practices

1. **Store tokens securely**: Use httpOnly cookies or secure storage
2. **Implement token refresh**: Use the refresh token to get new access tokens
3. **Handle errors gracefully**: Show user-friendly error messages
4. **Clear URL after token extraction**: Remove token from URL for security
5. **Validate redirectUri**: Ensure it's a valid URL belonging to the developer
6. **Monitor usage**: Track magic link requests to detect abuse

## Next Steps

The magic link authentication system is now complete and ready for production use. Developers can integrate it into their applications by following the frontend integration example above.