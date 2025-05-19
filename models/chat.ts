export interface Chat {
    id: string
    created_at: number
    updated_at: number
    chat_room_id: string
    sent_by: string
    sent_by_code: string
    message_type: string
    message_attachment: string
    message: string
  }
  
  export interface Participant {
    id: string
    created_at: number
    updated_at: number
    chat_room_id: string
    user_id: string
    display_name: string
    image_url: string
  }
  
  export interface ChatRoom {
    id: string
    created_at: number
    updated_at: number
    closed_at: number | null
    chats: Chat[]
    participant: Participant[]
  }
  
  export interface ChatQueue {
    id: string
    created_at: number
    updated_at: number
    requestor_id: string
  }
  
  export interface AdminChatQueue {
    turns_remaining: boolean
    queue: ChatQueue[]
  }
  
  export interface ChatRoomDetails {
    chat_room: ChatRoom
    chats: Chat[]
  }
  
  export interface AdminChatQueueExtended {
    assigned_chat_room: ChatRoom
    remaining_queue: ChatQueue[]
  }