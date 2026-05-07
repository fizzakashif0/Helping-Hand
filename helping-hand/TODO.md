# Helping-Hand Backend - Implementation TODO

## Step 1: Repo audit & wiring fixes
- [x] Inspect existing Node wiring (`backend/server.js`) and current auth (`shared/authMiddleware.js`)
- [x] Replace fake auth with real JWT verification + role checks

## Step 2: Create missing JS modules (per required pattern)
- [ ] Implement `modules/auth` in Node: `routes.js`, `controller.js`, `model.js`
- [x] Implement `modules/users` in Node: `routes.js`, `controller.js`, `model.js`

## Step 3: Multer uploads
- [ ] Add Multer config storing into:
  - [ ] `/uploads/profiles/`
  - [ ] `/uploads/donations/`

## Step 4: Socket.IO real-time
- [ ] Update `server.js` to attach Socket.IO
- [ ] Implement socket event handlers for chat + notifications

## Step 5: Mount modules & enforce middleware
- [x] Update `server.js` to mount auth/users routes under `/api/*`
- [ ] Apply auth middleware per route (public vs protected)

## Step 6: Donation/Request model alignment for live tracking
- [ ] Ensure donation categories and tracking fields match requirements
- [ ] Ensure request/donation matching logic is consistent

## Step 7: Testing & smoke checks
- [ ] Smoke test auth (signup/login/JWT)
- [ ] Smoke test protected endpoints
- [ ] Smoke test file uploads
- [ ] Smoke test socket events

