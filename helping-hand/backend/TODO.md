# Backend Auth Module - TODO

- [x] Overwrite `modules/auth/model.js` with the required `User` schema
- [x] Overwrite `modules/auth/controller.js` with `register/login/forgotPassword/verifyOtp/resetPassword`
- [x] Overwrite `modules/auth/routes.js` with the required routes
- [x] Overwrite `shared/authMiddleware.js` with `verifyToken` + `requireRole`
- [ ] Verify `app.js` mounts auth routes under the correct prefix (`/api/auth`)
- [ ] Run the backend and manually test endpoints with Postman/curl (note: `dotenv` missing currently)


