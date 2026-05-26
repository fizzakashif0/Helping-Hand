# Helping-Hand Backend: Authentication & Onboarding Backend

## Plan steps
1. Create/adjust modular folder structure under `backend/` to match spec.
2. Implement production JWT utilities: `backend/utils/generateToken.js`.
3. Replace placeholder `backend/shared/authMiddleware.js` with real JWT verification + role guard.
4. Update `backend/modules/auth/model.js` to match the required schema exactly (incl. validator, password select:false, OTP fields, timestamps).
5. Implement `backend/modules/auth/service.js` (register/login/OTP/verify/reset/google upsert).
6. Implement `backend/modules/auth/controller.js` (register/login/forgotPassword/verifyOtp/resetPassword/googleLogin) with correct status codes and no password leakage.
7. Implement `backend/modules/auth/routes.js` with required endpoints.
8. Implement `backend/modules/users/controller.js` (selectRole/updateProfile/getProfile) and `service.js`.
9. Update `backend/modules/users/routes.js` to required endpoints.
10. Fix model collision: stop using `modules/users/model.js` for auth; ensure server loads only the auth model.
11. Update `backend/package.json` and install missing deps: `validator`, `nodemailer`, `cors`.
12. Run server and smoke-test all endpoints:
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/forgot-password
   - POST /api/auth/verify-otp
   - POST /api/auth/reset-password
   - POST /api/auth/google-login
   - PATCH /api/users/select-role
   - PATCH /api/users/update-profile
   - GET /api/users/profile

## Progress
- Implemented: backend/utils (generateToken, hashPassword, sendOtp)
- Implemented: backend/shared/authMiddleware.js (real JWT verification + requireRole)
- Implemented: backend/modules/auth (model/controller/service/routes)
- Implemented: backend/modules/users (controller/service/routes)
- Updated: backend/server.js (loads auth model; routers handle JWT)





