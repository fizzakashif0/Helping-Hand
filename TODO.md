# TODO - Auth Improvements (MERN Mobile)

## Frontend: Error handling
- [x] Update `app/signup.tsx` to map backend validation errors to exact UI strings:
  - [x] Invalid email format -> “Invalid email format”
  - [x] Email already in use -> “Email already in use”
- [x] Ensure signup handles loading state and never fails silently.


- [x] Update `app/login.tsx` to map backend auth errors to exact UI strings:
  - [x] Invalid email address -> “Invalid email address”
  - [x] Incorrect password -> “Incorrect password”
- [x] Ensure generic auth errors show a friendly message.


## Frontend/Backend: Google Auth
- [ ] Verify Google sign-in/up end-to-end uses existing backend endpoint `/api/auth/google-login`.
- [ ] Ensure frontend loading/error handling is correct and no silent failures.

## Backend/Frontend: Email Verification
- [ ] Verify local sign-up triggers verification email and unverified users cannot log in.
- [ ] Confirm protected middleware blocks unverified local users.
- [ ] Adjust backend middleware or frontend flow only if required.

## Testing checklist
- [ ] Test signup invalid email -> expected alert text
- [ ] Test signup duplicate email -> expected alert text
- [ ] Test login wrong email -> expected alert text
- [ ] Test login wrong password -> expected alert text
- [ ] Test google sign-in for new/existing user
- [ ] Test email verification link flow + expired/invalid link handling

