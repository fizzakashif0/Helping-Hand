# TODO (Fixes 7/8, 9)

- [x] Inspect review worker and server/socket initialization points
- [ ] FIX 7/8: Refactor `backend/modules/reviews/reviewWorker.js` into `createReviewWorker(io)` and emit `review_processed` after updating review status
- [ ] FIX 7/8: Update `backend/server.js` to initialize `io` and call `createReviewWorker(io)`
- [ ] FIX 9: Add trust score controller method `getTrustScore`
- [ ] FIX 9: Add route `GET /api/users/:id/trust-score`
- [ ] FIX 9: Update `DonorProfile.tsx` to load trust score and show badge when loaded successfully
- [ ] FIX 9: Update `RecipientProfile.tsx` similarly

