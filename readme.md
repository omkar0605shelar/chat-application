
- Added compound index on Message model for optimized unread queries
- Implemented PATCH /api/v1/message/mark-as-read/:chatId
- Emit messagesSeen socket event on message read
- Sync unread count across clients in real-time
- Refactored chat state management (lifted to ChatPage)
- Instant UI update when selecting conversation
- Auto-increment unseenCount for inactive chats
- Real-time chat reordering based on updatedAt
- Implemented real-time seen checkmarks for sender