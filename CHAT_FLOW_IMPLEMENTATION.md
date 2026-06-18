# Chat Flow Implementation Summary

## Changes Made

### Backend (`/backend/modules/chat/`)

**Files Created:**
1. **model.js** - Two schemas:
   - `MatchRequest`: Tracks match requests between users
   - `Chat`: Stores active chat threads with messages

2. **controller.js** - Functions:
   - `createMatchRequest` - POST /api/chat/request
   - `acceptMatchRequest` - POST /api/chat/request/:id/accept
   - `rejectMatchRequest` - POST /api/chat/request/:id/reject
   - `getNotifications` - GET /api/chat/notifications/:userId
   - `getChatById` - GET /api/chat/:chatId (NEW)

3. **routes.js** - Registers all 5 endpoints

4. **server.js** - Updated to register `/api/chat` routes

### Frontend

#### PART A: Notification Bell Panel ✅

**File Updated:** `app/components/Recipient/NotificationScreen.tsx`

**Changes:**
- Rewired to fetch from `/api/chat/notifications/:userId`
- Displays match requests with Accept/Reject buttons
- Accept button → calls POST `/api/chat/request/:id/accept` → navigates to chat
- Reject button → calls POST `/api/chat/request/:id/reject` → dismisses card
- Shows postTitle, senderUsername, type (donor_to_recipient | recipient_to_donor)

**UI Features:**
- Green "Accept" button for pending requests
- Red "Reject" button
- Shows sender name and post title
- Timestamps (uses timeAgo utility)
- Loading states and error handling

#### PART B: "Help Now" Button (Donor Screen) ✅

**File Updated:** `app/components/Donor/DonationFeed.tsx`

**Changes:**
- Updated `handleContactRecipient` to use new API
- Calls POST `/api/chat/request` with:
  ```json
  {
    "senderId": "<currentUserId>",
    "receiverId": "<recipientId>",
    "postId": "<donationRequestId>",
    "postTitle": "<title>",
    "senderUsername": "<username>",
    "type": "donor_to_recipient"
  }
  ```
- Shows success toast: "Request sent! Wait for their response."
- Button disabled during request

**UI Feature:**
- Modal displays recipient request details
- "Help Now" button in modal sends the match request
- Loading state while sending

#### PART C: "Request This Donation" Button (Recipient Screen) ✅

**File Updated:** `app/components/Recipient/BrowseDonation.tsx`

**Changes:**
- Added `handleRequestDonation` function
- Calls POST `/api/chat/request` with:
  ```json
  {
    "senderId": "<currentUserId>",
    "receiverId": "<donorId>",
    "postId": "<donationId>",
    "postTitle": "<title>",
    "senderUsername": "<username>",
    "type": "recipient_to_donor"
  }
  ```
- Shows success toast: "Request sent! Wait for their response."
- Button disabled after sending

**UI Feature:**
- "Request This" button on each donation card
- Loading state while sending
- Disabled state after successful send

#### PART D: Chat Screen ✅

**File Updated:** `app/chat/[threadId].tsx`

**Changes:**
- Updated `fetchThread` to load chat from new API `/api/chat/:chatId`
- Loads messages array from Chat document
- Socket.io already integrated via socketService:
  - `socket.emit('join_room', { chatId, userId })` - via `socketService.joinThread()`
  - `socket.emit('send_message', { ... })` - via `socketService.sendMessage()`
  - `socket.on('receive_message', ...)` - via `socketService.onNewMessage()`
  - `socket.on('typing_indicator', ...)` - via `socketService.onTyping()`
  - `socket.emit('message_seen', ...)` - via `socketService.markRead()`

**Features:**
- Real-time messaging via Socket.io
- Typing indicators
- Message read receipts
- FlatList rendering with auto-scroll
- Keyboard avoiding view

---

## User Flow

### Scenario 1: Donor Wants to Help (Sees Recipient Request)
1. Donor browses recipient help requests in DonationFeed
2. Donor taps "Help Now" on a request
3. Modal opens showing request details
4. Donor confirms by tapping button in modal
5. POST `/api/chat/request` is called with type="donor_to_recipient"
6. Toast shows "Request sent!"
7. Recipient gets notification in NotificationScreen
8. Recipient taps "Accept" on notification
9. Chat is created and recipient is taken to chat screen
10. Both can now message

### Scenario 2: Recipient Wants a Donation (Sees Donor Donation)
1. Recipient browses donor donations in BrowseDonation
2. Recipient taps "Request This" button on a donation
3. POST `/api/chat/request` is called with type="recipient_to_donor"
4. Toast shows "Request sent!"
5. Donor gets notification in NotificationPanel
6. Donor taps "Accept" on notification
7. Chat is created and donor is taken to chat screen
8. Both can now message

---

## API Endpoints

### Notifications & Matching
- `POST /api/chat/request` - Create match request
- `POST /api/chat/request/:id/accept` - Accept and create chat
- `POST /api/chat/request/:id/reject` - Reject request
- `GET /api/chat/notifications/:userId` - Get user's notifications

### Chat
- `GET /api/chat/:chatId` - Get chat with messages

### Existing (for compatibility)
- Old endpoints in `/api/chat-requests/` and `/api/chats/` still work

---

## Testing Checklist

- [ ] POST /api/chat/request creates MatchRequest with status "pending"
- [ ] GET /api/chat/notifications/:userId returns match requests for user
- [ ] Accept button calls POST /api/chat/request/:id/accept
- [ ] Accept response includes { matchRequest, chat } with chatId
- [ ] Reject button calls POST /api/chat/request/:id/reject
- [ ] "Help Now" button sends donor_to_recipient request
- [ ] "Request This" button sends recipient_to_donor request
- [ ] Chat screen loads messages from new API
- [ ] Socket.io messaging works in chat screen
- [ ] Typing indicators display
- [ ] Message read receipts work

---

## Notes

- All date/time utilities (timeAgo) already in place
- buildApiUrl helper used for consistent endpoint URLs
- JWT decoded to get senderId and senderUsername
- Alert/Toast notifications for user feedback
- Loading states prevent duplicate requests
- Error handling with user-friendly messages
