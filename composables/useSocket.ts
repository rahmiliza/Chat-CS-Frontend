import { io } from 'socket.io-client';
import { ref } from 'vue';

const socket = io('http://localhost:3001');

export const useSocket = () => {
  const connected = ref(false);
  const onlineUsers = ref([]);
  const badgeCounts = ref({});

  socket.on('connect', () => {
    connected.value = true;
    const userId = localStorage.getItem('user_id');
    socket.emit('register_user', { userId });
  });

  socket.on('disconnect', () => {
    connected.value = false;
  });

  const joinRoom = (roomId) => {
    socket.emit('join_room', { roomId });
  };

  const sendMessage = (payload) => {
    socket.emit('send_message', payload);
  };

  const sendTyping = (payload) => {
    socket.emit('typing', payload);
  };

  const onNewMessage = (callback) => {
    socket.on('new_message', callback);
  };

  const onUserOnline = (callback) => {
    socket.on('user_online', callback);
  };

  const onUserOffline = (callback) => {
    socket.on('user_offline', callback);
  };

  const onBadgeUpdate = (callback) => {
    socket.on('badge_update', callback);
  };

  const onMessageDeleted = (callback) => {
    socket.on('message_deleted', callback);
  };

  const onParticipantUpdated = (callback) => {
    socket.on('participant_updated', callback);
  };

  const onTyping = (callback) => {
    socket.on('typing', callback);
  };

  return {
    socket,
    connected,
    joinRoom,
    sendMessage,
    sendTyping,
    onNewMessage,
    onUserOnline,
    onUserOffline,
    onBadgeUpdate,
    onMessageDeleted,
    onParticipantUpdated,
    onTyping,
    onlineUsers,
    badgeCounts,
  };
};