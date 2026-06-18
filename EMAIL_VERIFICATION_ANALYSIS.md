# Complete Email Verification Analysis - Helping Hand

## Executive Summary

The **"Please verify your email before logging in"** message in your app is **NOT ACTIVELY BLOCKING LOGIN** — the check is commented out as a "regression fix." However, email verification IS still enforced on protected routes (chat, messages, user profile endpoints).

---

## Answer to Your 10 Questions

### 1. **Where is the email verification check implemented?**

**Two locations:**

#### A. Login Check (DISABLED)
- **File**: [backend/modules/auth/service.js](backend/modules/auth/service.js#L115-L119)
- **Lines**: 115-119
- **Status**: COMMENTED OUT
```javascript
// Email verification gate removed to allow login without verified email (regression fix).
// if (user.authProvider === 'local' && !user.isVerified) {
//   const err = new Error('Please verify your email before logging in');
//   err.statusCode = 403;
//   throw err;
// }
```

#### B. Protected Routes Middleware Check (ACTIVE)
- **File**: [backend/shared/authMiddleware.js](backend/shared/authMiddleware.js#L44-L46)
- **Lines**: 44-46
- **Status**: ACTIVE
```javascript
if (user.authProvider === 'local' && !user.isVerified) {
  return res.status(403).json({ message: 'Please verify your email before accessing this resource' });
}
```

#### C. Error Message Handler (Frontend)
- **File**: [app/lib/authErrors.ts](app/lib/authErrors.ts#L45-L46)
- **Lines**: 45-46
```typescript
if (text.includes('verify your email')) {
  return message || 'Please verify your email before logging in.';
}
```

---

### 2. **Which authentication provider is being used?**

**Custom JWT with MongoDB (NOT Firebase, Supabase, or other third-party auth)**

- **Auth Type**: Custom JSON Web Tokens (JWT)
- **Backend**: Node.js + Express + MongoDB
- **Token Generation**: [backend/utils/generateToken.js](backend/utils/generateToken.js)
- **Token Payload**:
```javascript
jwt.sign(
  { id, email, role },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN } // default: '7d'
)
```
- **Token Storage (Frontend)**: AsyncStorage (React Native)
- **File**: [app/lib/token.ts](app/lib/token.ts)

**OAuth Support**: Google Login is also supported
- **File**: [backend/modules/auth/service.js](backend/modules/auth/service.js#L283) - `googleLogin()` function
- **Google users**: Automatically set as `isVerified: true` (bypass verification)

---

### 3. **What exactly is being checked during login?**

**Current Check (At Login Endpoint - DISABLED):**
```javascript
if (user.authProvider === 'local' && !user.isVerified) {
  // DISABLED: throw error
}
```

**What Gets Checked:**
- `user.isVerified` boolean field (defaults to `false` on registration)
- `user.authProvider` string (either `'local'` or `'google'`)
- **Only applies to**: Local/email signup users (NOT Google auth users)
- **NGO and Admin**: Also bypass this check

**Database Field** (from [backend/modules/auth/model.js](backend/modules/auth/model.js)):
```javascript
isVerified: {
  type: Boolean,
  default: false,
}
```

**Active Check (Protected Routes Middleware):**
Same check, but **ENFORCED** when accessing protected endpoints like:
- Chat/messaging endpoints
- User profile endpoints
- Chat request endpoints

---

### 4. **What happens when a user registers? Is a verification email automatically sent?**

**YES** — Verification email is sent automatically during registration.

#### Registration Flow:

**Endpoint**: `POST /api/auth/register`  
**Handler**: [backend/modules/auth/controller.js](backend/modules/auth/controller.js#L44-L49) + [backend/modules/auth/service.js](backend/modules/auth/service.js#L54-L88)

#### Step-by-Step:
```javascript
// Step 1: User submits registration
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Step 2: Backend creates user with verification fields
const user = {
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password...",
  authProvider: "local",
  isVerified: false,                                    // ← NOT verified yet
  emailVerificationToken: "randomhex...",               // ← 64-char random token
  emailVerificationExpiry: Date.now() + 24*60*60*1000, // ← Expires in 24 hours
  role: null                                            // ← Requires role selection later
}

// Step 3: Verification email is sent
// File: backend/utils/sendVerificationEmail.js
```

#### Email Verification Details:

**Email Service**: Gmail SMTP (requires environment variables)
- **Requires**: `EMAIL_USER` and `EMAIL_PASS` env variables
- **File**: [backend/utils/sendVerificationEmail.js](backend/utils/sendVerificationEmail.js)

**Email Content**:
```
Subject: Helping Hand — Verify your email

Hi John,

Thanks for signing up for Helping Hand. Please verify your email address:

[Web Link] http://localhost:5000/api/auth/verify-email?token=abc123...

Or open this link in the app: helpinghand://verify-email?token=abc123...

This link expires in 24 hours.

If you did not create an account, you can ignore this email.
```

**Debug Mode** (if EMAIL_USER/EMAIL_PASS not configured):
- Email NOT sent, but verification link is returned in API response for testing
- Frontend shows dev link in console if `__DEV__` mode is enabled
- File: [app/signup.tsx](app/signup.tsx#L112-L120)

**Backend Response** after registration:
```javascript
{
  "user": {
    "id": "user_id...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": null,
    "isVerified": false
  },
  "message": "Registration successful"
}
```

**Frontend Response** (from [app/signup.tsx](app/signup.tsx)):
- Shows modal: "We sent a verification link to your email. Please verify your account, then log in."
- Redirects to login after 3 seconds

---

### 5. **Does the app periodically reload the user's auth state to detect verification?**

**NO** — The app does NOT periodically check if email has been verified.

#### Current Behavior:
1. User verifies email by clicking link → Backend sets `isVerified: true`
2. User attempts login → **Login succeeds** (verification check is disabled)
3. User tries to access protected resource (chat/messages) → **Blocked with 403 error**
4. User sees: "Please verify your email before accessing this resource"
5. **No automatic re-check** — user must re-attempt the action after verification

#### What WOULD Need to Happen (if needed):
- Periodically call `/api/users/profile` endpoint
- Compare current `user.isVerified` with stored value
- Automatically grant access once verified
- **Current Implementation**: Does NOT do this

#### Verification Process:
**File**: [backend/modules/auth/service.js](backend/modules/auth/service.js#L229-L250) - `verifyEmail()` function

```javascript
async function verifyEmail(token) {
  // Find user with matching token and non-expired expiry
  const user = await User.findOne({
    emailVerificationToken: String(token),
    emailVerificationExpiry: { $gt: new Date() }, // Must not be expired
  });

  if (!user) {
    throw new Error('Invalid or expired verification link');
  }

  // Mark as verified
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  return { success: true, message: 'Email verified successfully. You can now log in.' };
}
```

---

### 6. **What security or business reason was this verification requirement added for? Is it necessary?**

#### Security Reasons:
1. **Email Ownership Verification**: Ensures user actually owns the email address they registered with
2. **Typo Prevention**: Catches email typos before user gets locked out
3. **Spam/Bot Prevention**: Adds friction to prevent mass account creation
4. **Communication Channel**: Guarantees app can reach user at their email
5. **Password Reset Security**: Verifies email is reachable for account recovery

#### Business Reasons:
1. **User Trust**: Demonstrates legitimate user base
2. **Email Deliverability**: Critical for notifications and communication
3. **Regulatory Compliance**: Some jurisdictions require email verification for services
4. **NGO Verification**: Different from email verification — NGOs need organization verification

#### Why Was It Disabled at Login?

From code comment: **"Email verification gate removed to allow login without verified email (regression fix)"**

**Likely Reasons for Disabling**:
- ❌ Email service (Gmail) failed → Users couldn't verify → Locked out
- ❌ Users lost verification emails → Couldn't re-verify without manual intervention
- ✅ Solution: Allow login but gate advanced features (chat, messaging)
- ✅ Better UX: Users can explore app while waiting for email

#### Current State (Hybrid Approach):
- ✅ Users CAN login without verification (regression fix)
- ❌ Users CANNOT use chat/messaging without verification
- ✅ Maintains security for sensitive features
- ✅ Better UX if email service fails

---

### 7. **If this check were removed, what functionality or security guarantees would be affected?**

#### If COMPLETELY Removed (login + protected routes):

| Functionality | Impact |
|---------------|--------|
| **Messaging/Chat** | Spam bots could create accounts and spam unverified emails |
| **User Trustworthiness** | Can't guarantee user owns email → trust scores unreliable |
| **Email Notifications** | Users miss critical updates (donation matches, messages) |
| **Password Reset** | Account recovery fails if email not verified |
| **Admin Moderation** | Can't contact users for violations (fake emails) |
| **Donation Accountability** | Donors/recipients with fake emails harder to hold accountable |

#### Current Protected Routes (would be vulnerable if removed):

**These endpoints currently require email verification:**
- `POST /api/messages/:threadId/messages` — Send chat messages
- `GET /api/messages/:threadId/messages` — View messages
- `POST /api/chat-requests` — Send chat request
- `PATCH /api/users/update-profile` — Update user profile
- `PATCH /api/users/select-role` — Select user role

#### Currently UNPROTECTED (already exposed):
- `GET /api/donations` — Browse donations (no verification needed)
- `GET /api/requests` — Browse requests (no verification needed)
- `POST /api/donations` — Create donation (no verification needed!)
- `POST /api/requests` — Create request (no verification needed!)

**Security Issue**: Donation/request creation has NO email verification requirement → already vulnerable to spam

#### What WOULDN'T Change:
- ✅ Password hashing still required
- ✅ JWT token expiration still enforced
- ✅ NGO verification process unaffected
- ✅ Admin authentication unaffected

---

### 8. **Trace the complete flow from registration → email sent → verification → login**

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. USER ENTERS SIGNUP FORM
   ├─ File: app/signup.tsx
   ├─ Input: Name, Email, Password
   └─ Action: Click "Sign Up"

2. CLIENT VALIDATION
   ├─ Email regex check: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   ├─ Password length: >= 6 characters
   └─ Name: required

3. API CALL: POST /api/auth/register
   ├─ Endpoint: backend/modules/auth/routes.js
   ├─ Controller: backend/modules/auth/controller.js (register function)
   └─ Service: backend/modules/auth/service.js (registerUser function)

4. SERVER VALIDATION
   ├─ Normalize email (lowercase, trim)
   ├─ Check valid email format
   ├─ Check if email already registered
   └─ Validate password provided

5. CREATE USER IN DATABASE
   ├─ File: backend/modules/auth/model.js (MongoDB schema)
   ├─ Hash password using bcryptjs
   ├─ Generate verification fields:
   │  ├─ emailVerificationToken: crypto.randomBytes(32).toString('hex')
   │  ├─ emailVerificationExpiry: now + 24 hours
   │  └─ isVerified: false
   ├─ Set authProvider: 'local'
   ├─ Set role: null (requires selection later)
   └─ Save to MongoDB

6. SEND VERIFICATION EMAIL
   ├─ File: backend/utils/sendVerificationEmail.js
   ├─ Service: Gmail SMTP (requires EMAIL_USER, EMAIL_PASS)
   ├─ Email contains:
   │  ├─ Web link: {API_URL}/api/auth/verify-email?token={token}
   │  ├─ App deep link: helpinghand://verify-email?token={token}
   │  └─ Expires in: 24 hours
   └─ Debug: If no email service, returns link in response

7. RETURN RESPONSE TO FRONTEND
   ├─ Status: 201 Created
   ├─ Body:
   │  ├─ user: { id, name, email, role: null, isVerified: false }
   │  └─ message: "Registration successful"
   └─ Frontend: Show success modal

8. FRONTEND SHOWS SUCCESS MODAL
   ├─ File: app/signup.tsx
   ├─ Message: "We sent a verification link to your email..."
   ├─ Dev hint: Shows verification URL if __DEV__ mode
   └─ Auto-redirect to /login after 3 seconds

┌─────────────────────────────────────────────────────────────────┐
│                   EMAIL VERIFICATION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

9. USER RECEIVES EMAIL
   └─ Clicks verification link (web or app deep link)

10. USER CLICKS WEB LINK
    ├─ URL: /api/auth/verify-email?token={token}
    ├─ Handler: backend/modules/auth/controller.js (verifyEmailGet)
    ├─ Renders HTML page: "Email verified" ✓ or "Verification failed" ✗
    └─ Response type: HTML (for browser), JSON (if POST request)

11. USER CLICKS APP DEEP LINK
    ├─ Deep link: helpinghand://verify-email?token={token}
    ├─ Handled by: app/verify-email.tsx
    ├─ Component flow:
    │  ├─ Extract token from URL params
    │  ├─ useEffect: Auto-call /api/auth/verify-email
    │  └─ Show: Loading → Success/Error
    └─ User sees: "Email verified successfully. You can now log in."

12. VERIFY EMAIL API ENDPOINT
    ├─ Endpoint: POST /api/auth/verify-email
    ├─ File: backend/modules/auth/service.js (verifyEmail function)
    ├─ Logic:
    │  ├─ Find user with matching token
    │  ├─ Check token hasn't expired (emailVerificationExpiry > now)
    │  ├─ Set user.isVerified = true
    │  ├─ Clear verification token fields
    │  ├─ Save to database
    │  └─ Return: { success: true, message: "Email verified..." }
    └─ Status: 200 OK or 400 Bad Request

13. DATABASE UPDATE
    ├─ Set: isVerified = true
    ├─ Clear: emailVerificationToken = null
    ├─ Clear: emailVerificationExpiry = null
    └─ Save: To MongoDB

┌─────────────────────────────────────────────────────────────────┐
│                        LOGIN FLOW                               │
└─────────────────────────────────────────────────────────────────┘

14. USER RETURNS TO LOGIN
    ├─ File: app/login.tsx
    ├─ Input: Email, Password
    └─ Action: Click "Log In as Donor/Recipient"

15. CLIENT VALIDATION
    ├─ Check: Email and password provided
    └─ Check: Not empty strings

16. API CALL: POST /api/auth/login
    ├─ Endpoint: backend/modules/auth/routes.js
    ├─ Controller: backend/modules/auth/controller.js (login function)
    └─ Service: backend/modules/auth/service.js (loginUser function)

17. SERVER AUTHENTICATION
    ├─ Normalize email (lowercase, trim)
    ├─ Find user by email
    ├─ Check: User exists (else: 401 "Invalid email address")
    ├─ Check: User not blocked (else: 403 "Account is blocked")
    ├─ **VERIFICATION CHECK (DISABLED)**:
    │  └─ // if (user.authProvider === 'local' && !user.isVerified)
    │     //   throw error (THIS IS COMMENTED OUT)
    ├─ Compare: Password matches (else: 401 "Incorrect password")
    └─ Generate: JWT token

18. GENERATE JWT TOKEN
    ├─ File: backend/utils/generateToken.js
    ├─ Payload:
    │  ├─ id: user._id
    │  ├─ email: user.email
    │  └─ role: user.role
    ├─ Secret: JWT_SECRET env variable
    ├─ Expiry: 7 days (default)
    └─ Example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

19. RETURN LOGIN RESPONSE
    ├─ Status: 200 OK
    ├─ Body:
    │  ├─ token: "jwt_token_string..."
    │  ├─ user: { id, name, email, role: null, isVerified: true }
    │  └─ requiresRoleSelection: true (if role is null)
    └─ Note: JWT token doesn't contain isVerified flag

20. FRONTEND STORES TOKEN
    ├─ File: app/lib/token.ts
    ├─ Method: AsyncStorage.setItem('auth_token', token)
    ├─ Storage: React Native AsyncStorage (persistent)
    └─ Used for: All future API requests (Authorization header)

21. FRONTEND REDIRECTS
    ├─ If requiresRoleSelection:
    │  └─ → /role-selection (user picks donor/recipient)
    └─ Else:
       └─ → /home (main app)

┌─────────────────────────────────────────────────────────────────┐
│           ACCESSING PROTECTED FEATURES (E.G., CHAT)            │
└─────────────────────────────────────────────────────────────────┘

22. USER TRIES TO SEND MESSAGE
    ├─ Endpoint: POST /api/messages/:threadId/messages
    ├─ Request includes: Authorization: Bearer {token}
    └─ File: backend/modules/messages/routes.js

23. MIDDLEWARE: VERIFY TOKEN
    ├─ File: backend/shared/authMiddleware.js (verifyToken)
    ├─ Extract JWT token from Authorization header
    ├─ Verify signature using JWT_SECRET
    ├─ Decode payload: { id, email, role }
    ├─ Find user in database by ID
    └─ Check: User still exists and not blocked

24. MIDDLEWARE: CHECK EMAIL VERIFICATION
    ├─ File: backend/shared/authMiddleware.js (line 44-46)
    ├─ Condition:
    │  └─ if (user.authProvider === 'local' && !user.isVerified)
    ├─ If true:
    │  ├─ Status: 403 Forbidden
    │  ├─ Response: { message: "Please verify your email before accessing this resource" }
    │  └─ Request blocked
    └─ If false:
       └─ Request allowed (next())

25. USER GETS 403 ERROR
    ├─ Frontend receives: 403 Forbidden
    ├─ Error message: "Please verify your email before accessing this resource"
    ├─ File: app/lib/authErrors.ts (getLoginErrorMessage)
    ├─ Message is parsed and displayed to user
    └─ User prompted to verify email

26. USER VERIFIES EMAIL
    ├─ Follows steps 9-13 above
    └─ isVerified set to true in database

27. USER RETRIES MESSAGE
    ├─ Same endpoint: POST /api/messages/:threadId/messages
    ├─ Middleware check: user.isVerified = true
    ├─ Middleware: Request allowed
    ├─ Message sent successfully
    └─ User: Message appears in chat

┌─────────────────────────────────────────────────────────────────┐
│            SPECIAL CASES (GOOGLE, NGO, ADMIN)                  │
└─────────────────────────────────────────────────────────────────┘

GOOGLE LOGIN (Verification Bypassed):
├─ File: backend/modules/auth/service.js (googleLogin function)
├─ Sets: authProvider: 'google'
├─ Sets: isVerified: true (immediately)
├─ Middleware check: authProvider === 'local' → FALSE
├─ Result: No verification block even if email unverified
└─ Note: Google already verified email on their side

NGO REGISTRATION (Verification Bypassed):
├─ File: backend/modules/auth/service.js (registerNGO function)
├─ Sets: isVerified: true (immediately)
├─ Has separate: ngoProfile.verificationStatus (pending/approved/rejected)
├─ Middleware check: authProvider === 'local' → FALSE
├─ Result: Can use all features immediately
└─ Note: NGO verified by admin, not by email

ADMIN LOGIN (No Verification):
├─ Only possible via: POST /api/auth/login-admin
├─ Requires: role === 'admin' in database
├─ Verification: Not checked
└─ Setup: Via backend/scripts/seedAdmin.js

```

---

### 9. **List all files, functions, and API calls involved**

#### Frontend Files (React Native/TypeScript)

| File | Purpose | Key Functions/Components |
|------|---------|--------------------------|
| [app/signup.tsx](app/signup.tsx) | User registration screen | `handleSignup()`, email validation |
| [app/login.tsx](app/login.tsx) | User login screen | `handleLogin()`, `callLogin()`, `handleNGOLogin()` |
| [app/verify-email.tsx](app/verify-email.tsx) | Email verification UI | `useEffect()` (auto-verify), `handleResend()` |
| [app/lib/authErrors.ts](app/lib/authErrors.ts) | Error message parsing | `getLoginErrorMessage()`, `getSignupErrorMessage()` |
| [app/lib/token.ts](app/lib/token.ts) | JWT token management | `saveToken()`, `getToken()`, `clearToken()` |
| [app/lib/apiClient.ts](app/lib/apiClient.ts) | HTTP requests | `apiFetch()` |
| [app/lib/parseApiResponse.ts](app/lib/parseApiResponse.ts) | Response parsing | `parseApiResponse()` |

#### Backend Files (Node.js/Express)

| File | Purpose | Key Functions |
|------|---------|----------------|
| [backend/server.js](backend/server.js) | Express app setup | Server initialization, route mounting |
| **Auth Module** | | |
| [backend/modules/auth/routes.js](backend/modules/auth/routes.js) | API endpoints | Routes for register, login, verify-email |
| [backend/modules/auth/controller.js](backend/modules/auth/controller.js) | HTTP handlers | `register()`, `login()`, `loginNGO()`, `loginAdmin()`, `verifyEmailGet()`, `verifyEmailPost()`, `resendVerification()` |
| [backend/modules/auth/service.js](backend/modules/auth/service.js) | Business logic | `registerUser()`, `loginUser()`, `verifyEmail()`, `resendVerificationEmail()`, `googleLogin()`, `registerNGO()`, `loginNGO()`, `loginAdmin()` |
| [backend/modules/auth/model.js](backend/modules/auth/model.js) | Database schema | User mongoose schema with verification fields |
| **Middleware** | | |
| [backend/shared/authMiddleware.js](backend/shared/authMiddleware.js) | JWT verification | `verifyToken()`, `requireRole()` |
| **Utilities** | | |
| [backend/utils/generateToken.js](backend/utils/generateToken.js) | JWT creation | `generateToken()` |
| [backend/utils/sendVerificationEmail.js](backend/utils/sendVerificationEmail.js) | Email sending | `sendVerificationEmail()`, `createTransporter()` |
| [backend/utils/hashPassword.js](backend/utils/hashPassword.js) | Password hashing | `hashPassword()`, `comparePassword()` |
| **Routes Using Middleware** | | |
| [backend/modules/users/routes.js](backend/modules/users/routes.js) | Protected user endpoints | Uses `verifyToken` middleware |
| [backend/modules/messages/routes.js](backend/modules/messages/routes.js) | Protected chat endpoints | Uses `verifyToken` middleware |
| [backend/modules/chatRequests/routes.js](backend/modules/chatRequests/routes.js) | Protected chat requests | Uses `verifyToken` middleware |
| [backend/modules/chats/routes.js](backend/modules/chats/routes.js) | Protected chat threads | Uses `verifyToken` middleware |

#### API Endpoints

| Method | Endpoint | Auth Required | Verification Enforced | Purpose |
|--------|----------|---|---|---------|
| POST | `/api/auth/register` | No | N/A | User registration |
| POST | `/api/auth/login` | No | No (disabled) | User login |
| POST | `/api/auth/login-ngo` | No | No | NGO login |
| POST | `/api/auth/login-admin` | No | No | Admin login |
| POST | `/api/auth/register-ngo` | No | N/A | NGO registration |
| POST | `/api/auth/google-login` | No | No | Google OAuth login |
| GET/POST | `/api/auth/verify-email` | No | N/A | Email verification link |
| POST | `/api/auth/resend-verification` | No | N/A | Resend verification email |
| POST | `/api/auth/forgot-password` | No | N/A | Password reset request |
| POST | `/api/auth/verify-otp` | No | N/A | OTP verification |
| POST | `/api/auth/reset-password` | No | N/A | Password reset completion |
| PATCH | `/api/users/select-role` | Yes | **Yes** | Select donor/recipient role |
| PATCH | `/api/users/update-profile` | Yes | **Yes** | Update user profile |
| GET | `/api/users/profile` | Yes | **Yes** | Get user profile |
| GET | `/api/users/:id/trust-score` | Yes | **Yes** | Get trust score |
| POST | `/api/messages/:threadId/messages` | Yes | **Yes** | Send chat message |
| GET | `/api/messages/:threadId/messages` | Yes | **Yes** | Get messages |
| PATCH | `/api/messages/:threadId/messages/read` | Yes | **Yes** | Mark messages as read |
| POST | `/api/chat-requests` | Yes | **Yes** | Send chat request |
| PATCH | `/api/chat-requests/:id/accept` | Yes | **Yes** | Accept chat request |
| PATCH | `/api/chat-requests/:id/decline` | Yes | **Yes** | Decline chat request |
| GET | `/api/chat-requests/pending` | Yes | **Yes** | Get pending requests |
| POST | `/api/chats` | Yes | **Yes** | Create chat thread |
| GET | `/api/chats` | Yes | **Yes** | Get chat threads |
| GET | `/api/chats/:id` | Yes | **Yes** | Get chat by ID |
| GET/POST | `/api/donations` | No | No | Browse donations |
| POST | `/api/donations` | No | No | Create donation |
| GET | `/api/requests` | No | No | Browse requests |
| POST | `/api/requests` | No | No | Create request |

---

### 10. **Is this logic used elsewhere or only at login?**

#### Where Email Verification Check IS Used (ACTIVE):

**1. Protected Routes Middleware** ✅ ACTIVE
- **File**: [backend/shared/authMiddleware.js](backend/shared/authMiddleware.js#L44-L46)
- **Applied to**: All routes using `verifyToken` middleware
- **Blocks**: Chat, messaging, user profile endpoints
- **Message**: "Please verify your email before accessing this resource"

**Routes Affected**:
- ✅ Chat messaging endpoints
- ✅ Chat request endpoints
- ✅ User profile updates
- ✅ Role selection
- ✅ Any future endpoint adding `verifyToken` middleware

**2. In Error Handler** ✅ ACTIVE
- **File**: [app/lib/authErrors.ts](app/lib/authErrors.ts#L45-L46)
- **Purpose**: Parses backend error messages
- **Shows**: "Please verify your email before logging in."

#### Where Email Verification Check IS NOT Used:

**1. Donation Creation** ❌ NO VERIFICATION
- **Endpoint**: `POST /api/donations`
- **No middleware**: Can create donations without verification
- **Security Issue**: Spam bots could post fake donations

**2. Request Creation** ❌ NO VERIFICATION
- **Endpoint**: `POST /api/requests`
- **No middleware**: Can create requests without verification
- **Security Issue**: Spam bots could post fake requests

**3. Reading/Browsing** ❌ NO VERIFICATION (by design)
- **Endpoints**: `GET /api/donations`, `GET /api/requests`
- **Allowed**: Unverified users can browse available donations/requests
- **Rationale**: Better UX — can browse before committing to role selection

**4. Disabled Login Check** ❌ INACTIVE
- **File**: [backend/modules/auth/service.js](backend/modules/auth/service.js#L115-L119)
- **Status**: Commented out
- **Reason**: Regression fix to allow login

#### Special Cases:

**Google Auth Users**:
- ✅ Bypasses verification entirely
- 🔍 Check: `if (user.authProvider === 'local' && !user.isVerified)`
- Condition `authProvider === 'local'` returns FALSE for Google users
- Result: No verification block even if email not verified by app

**NGO Users**:
- ✅ Bypasses email verification
- ✅ Has separate NGO verification process: `ngoProfile.verificationStatus`
- Check doesn't apply because `isVerified` is set to `true` on registration
- Actual gate: Admin must approve NGO (approved/rejected/pending)

**Admin Users**:
- ✅ No email verification check
- ✅ Only email-based access control: role must be 'admin'
- Setup via: [backend/scripts/seedAdmin.js](backend/scripts/seedAdmin.js)

---

## Summary Table: Where Verification is Enforced

| Component | Location | Status | Blocks? | Affected Users |
|-----------|----------|--------|---------|-----------------|
| **Login** | `service.js:115` | ❌ Disabled | No | All |
| **Chat/Messages** | `authMiddleware.js:44` | ✅ Active | Yes | Local unverified |
| **Chat Requests** | `authMiddleware.js:44` | ✅ Active | Yes | Local unverified |
| **User Profile** | `authMiddleware.js:44` | ✅ Active | Yes | Local unverified |
| **Role Selection** | `authMiddleware.js:44` | ✅ Active | Yes | Local unverified |
| **Donations** | None | ❌ None | No | All |
| **Requests** | None | ❌ None | No | All |
| **Google Login** | None | ❌ N/A | No | N/A |
| **NGO** | Separate | ✅ Different | Yes | NGO verification |
| **Admin** | None | ❌ None | No | Admin only |

---

## Code Examples

### Complete Registration Flow (Frontend + Backend)

#### Frontend: app/signup.tsx
```typescript
const handleSignup = async () => {
  // Validate inputs
  if (!validate()) return;
  
  setLoading(true);
  try {
    const response = await apiFetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
      }),
    });

    const { ok, status, data } = await parseApiResponse<any>(response);

    if (!ok) {
      // Handle error
      const errorMessage = getSignupErrorMessage(status, rawMessage);
      setEmailError(errorMessage);
      return;
    }

    // Show success modal
    const detail = data?.message || 
      "We sent a verification link to your email. Please verify your account, then log in.";
    setSuccessDetail(detail);
    setShowSuccessModal(true);

    // Redirect to login after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
      router.push("/login");
    }, 3000);
  } catch (err: any) {
    setGlobalError(err?.message || "Network error. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

#### Backend: backend/modules/auth/service.js
```javascript
async function registerUser({ name, email, password }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  assertValidEmail(normalizedEmail);

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await hashPassword(password);
  const verification = createEmailVerificationFields(); // Creates token + expiry

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password: hashed,
    role: null,
    authProvider: 'local',
    isVerified: false,
    ...verification, // emailVerificationToken, emailVerificationExpiry
  });

  const mailResult = await sendVerificationEmail({
    toEmail: user.email,
    name: user.name,
    verificationToken: verification.emailVerificationToken,
  });

  return {
    user: toPublicUser(user),
    message: 'Registration successful',
  };
}
```

### Email Verification Flow

#### Backend: backend/utils/sendVerificationEmail.js
```javascript
async function sendVerificationEmail({ toEmail, name, verificationToken }) {
  const transporter = createTransporter(); // Gmail SMTP
  const baseUrl = getPublicApiBaseUrl();
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
  const appDeepLink = `helpinghand://verify-email?token=${encodeURIComponent(verificationToken)}`;

  if (!transporter) {
    console.warn('[auth] EMAIL_USER/EMAIL_PASS not configured');
    return { sent: false, verifyUrl, appDeepLink };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Helping Hand — Verify your email',
    text: `Hi ${name},\n\nPlease verify your email:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>Hi ${name},</p><p>Please verify: <a href="${verifyUrl}">Verify</a></p>`,
  });

  return { sent: true, verifyUrl, appDeepLink };
}
```

#### Frontend: app/verify-email.tsx
```typescript
export default function VerifyEmailScreen() {
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = typeof tokenParam === 'string' ? tokenParam : tokenParam?.[0];
    if (!token) {
      setStatus('idle');
      return;
    }

    (async () => {
      setStatus('loading');
      try {
        const response = await apiFetch('/api/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        const { ok, data } = await parseApiResponse(response);

        if (!ok) {
          setStatus('error');
          setMessage(data.message || 'Invalid or expired verification link');
          return;
        }

        setStatus('success');
        setMessage(data.message || 'Email verified successfully. You can now log in.');
      } catch {
        setStatus('error');
        setMessage('Unable to verify email. Please try again.');
      }
    })();
  }, [tokenParam]);

  return (
    <View style={styles.container}>
      {status === 'loading' && <ActivityIndicator />}
      {status === 'success' && <Text style={styles.success}>{message}</Text>}
      {status === 'error' && <Text style={styles.error}>{message}</Text>}
    </View>
  );
}
```

#### Backend: backend/modules/auth/service.js
```javascript
async function verifyEmail(token) {
  if (!token) {
    const err = new Error('Invalid or expired verification link');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({
    emailVerificationToken: String(token),
    emailVerificationExpiry: { $gt: new Date() }, // Must not be expired
  }).select('+emailVerificationToken +emailVerificationExpiry');

  if (!user) {
    const err = new Error('Invalid or expired verification link');
    err.statusCode = 400;
    throw err;
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  return {
    success: true,
    message: 'Email verified successfully. You can now log in.',
  };
}
```

### Login Flow with Disabled Verification Check

#### Backend: backend/modules/auth/service.js
```javascript
async function loginUser({ email, password }) {
  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    const err = new Error('Invalid email address');
    err.statusCode = 401;
    throw err;
  }

  if (user.isBlocked) {
    const err = new Error('Account is blocked');
    err.statusCode = 403;
    throw err;
  }

  // ❌ VERIFICATION CHECK DISABLED (regression fix)
  // if (user.authProvider === 'local' && !user.isVerified) {
  //   const err = new Error('Please verify your email before logging in');
  //   err.statusCode = 403;
  //   throw err;
  // }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    const err = new Error('Incorrect password');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({ id: user._id, email: user.email, role: user.role });

  return {
    token,
    user: toPublicUser(user),
    requiresRoleSelection: makeRequiresRoleSelection(user),
  };
}
```

### Protected Route Check (Active)

#### Backend: backend/shared/authMiddleware.js
```javascript
async function verifyToken(req, res, next) {
  try {
    const token = extractBearerToken(getAuthHeader(req));
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server misconfiguration' });
    }

    const decoded = jwt.verify(token, secret);
    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role || null,
    };

    const user = await User.findById(req.user.id).select('isVerified authProvider isBlocked');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    // ✅ ACTIVE EMAIL VERIFICATION CHECK
    if (user.authProvider === 'local' && !user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before accessing this resource' });
    }

    return next();
  } catch (err) {
    const message = err?.name === 'TokenExpiredError'
      ? 'Token expired'
      : 'Invalid token';
    return res.status(401).json({ message });
  }
}
```

---

## Key Takeaways

1. ✅ **Email verification IS implemented** in your code
2. ❌ **But it's DISABLED at login** (commented out as regression fix)
3. ✅ **It IS still enforced on protected routes** (chat, messages, user profile)
4. 📧 **Uses Gmail SMTP** (requires EMAIL_USER, EMAIL_PASS env vars)
5. 🔐 **Only applies to local auth**, not Google or NGO users
6. 🎯 **Protects sensitive features** but allows basic app usage
7. 📱 **Supports both web and app deep links** for verification
8. ⏰ **Tokens expire after 24 hours**
9. 🔒 **JWT tokens are 7 days** (default)
10. 🚨 **Security gap**: Donations/requests can be created without verification

