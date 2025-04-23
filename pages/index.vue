<template>
  <div class="min-h-screen bg-gray-100">
    <div class="flex">
     <!-- Main Content -->
      <main class="flex-1 p-8">
        <div class="mb-6 flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-600">Dashboard</h1>
          <button @click="openModal" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Create New Ticket
          </button>
        </div>

        <!-- New Ticket Modal -->
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div class="bg-white p-6 rounded-lg shadow-md max-w-lg w-full">
            <h3 class="text-xl font-semibold text-gray-700">Create New Ticket</h3>
            <form @submit.prevent="createTicket" class="space-y-4 mt-4">
              <div>
                <label for="customerName" class="block text-gray-700">Customer Name</label>
                <input v-model="newTicket.customerName" id="customerName" type="text" class="w-full p-2 border border-gray-300 rounded-md text-gray-700"  />
              </div>
              <div>
                <label for="issueDescription" class="block text-gray-700">Issue Description</label>
                <textarea v-model="newTicket.issueDescription" id="issueDescription" class="w-full p-2 border border-gray-300 rounded-md text-gray-700" rows="4" ></textarea>
              </div>
              <div>
                <label for="priority" class="block text-gray-700">Priority</label>
                <select v-model="newTicket.priority" id="priority" class="w-full p-2 border border-gray-300 rounded-md text-gray-700" >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div class="flex justify-end space-x-2">
                <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Submit Ticket
                </button>
                <button @click="closeModal" class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold text-gray-700">Active Tickets</h3>
            <p class="text-2xl font-bold text-blue-600 mt-2">{{ activeTickets }}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold text-gray-700">Resolved Tickets</h3>
            <p class="text-2xl font-bold text-green-600 mt-2">{{ resolvedTickets }}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold text-gray-700">Pending Tickets</h3>
            <p class="text-2xl font-bold text-yellow-600 mt-2">{{ pendingTickets }}</p>
          </div>
        </div>

        <!-- Ticket List Table -->
        <div class="bg-white p-6 rounded-lg shadow-md mt-8">
          <h3 class="text-xl font-semibold text-gray-700">Recent Tickets</h3>
          <table class="min-w-full mt-4">
            <thead>
              <tr class="text-left border-b text-gray-600">
                <th class="py-3 px-4">Ticket ID</th>
                <th class="py-3 px-4">Customer</th>
                <th class="py-3 px-4">Priority</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in tickets" :key="ticket.ticketId" class="border-b text-gray-600">
                <td class="py-3 px-4">{{ ticket.ticketId }}</td>
                <td class="py-3 px-4">{{ ticket.customerName }}</td>
                <td class="py-3 px-4">{{ ticket.priority }}</td>
                <td class="py-3 px-4" :class="statusClass(ticket.status)">{{ ticket.status }}</td>
                <td class="py-3 px-4">
                  <button class="text-blue-600 hover:underline">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>

import { ref } from 'vue';
import { defineProps, defineEmits } from 'vue';

  // Modal visibility state
  const props = defineProps({
  show: Boolean,
  title: String
});

  let showModal = ref(false);

  const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
}

const emit = defineEmits(['close', 'submit']);

const close = () => {
  emit('close');
};

const handleSubmit = () => {
  emit('submit');
  close();
};
  // Ticket data
  const tickets = [
    { ticketId: '#001', customerName: 'John Doe', status: 'Pending', priority: 'Medium', createdAt: '2025-03-25' },
    { ticketId: '#002', customerName: 'Jane Smith', status: 'Resolved', priority: 'High', createdAt: '2025-03-23' },
    { ticketId: '#003', customerName: 'Alice Johnson', status: 'Active', priority: 'Low', createdAt: '2025-03-26' },
    { ticketId: '#004', customerName: 'Bob Brown', status: 'Active', priority: 'Medium', createdAt: '2025-03-27' },
    { ticketId: '#005', customerName: 'Charlie Davis', status: 'Resolved', priority: 'Low', createdAt: '2025-03-28' },
    { ticketId: '#006', customerName: 'David Wilson', status: 'Pending', priority: 'High', createdAt: '2025-03-29' },
    { ticketId: '#007', customerName: 'Eve Miller', status: 'Active', priority: 'Medium', createdAt: '2025-03-30' },
    { ticketId: '#008', customerName: 'Frank White', status: 'Resolved', priority: 'Low', createdAt: '2025-03-31' },
    { ticketId: '#009', customerName: 'Grace Lee', status: 'Pending', priority: 'High', createdAt: '2025-04-01' },
    { ticketId: '#010', customerName: 'Henry Hall', status: 'Active', priority: 'Medium', createdAt: '2025-04-02' },
  ];

  // New Ticket form data
  const newTicket = {
    customerName: '',
    issueDescription: '',
    priority: 'Low',
  };




  // Ticket counts
  const activeTickets = tickets.filter(ticket => ticket.status === 'Active').length;
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'Resolved').length;
  const pendingTickets = tickets.filter(ticket => ticket.status === 'Pending').length;

  // Add new ticket to the tickets list
  const createTicket = () => {
    const newTicketData = {
      ticketId: `#${(tickets.length + 1).toString().padStart(3, '0')}`,
      customerName: newTicket.customerName,
      status: 'Pending',
      priority: newTicket.priority,
      createdAt: new Date().toLocaleDateString(),
    };

    // Add new ticket to the tickets array
    tickets.push(newTicketData);

    // Reset form
    newTicket.customerName = '';
    newTicket.issueDescription = '';
    newTicket.priority = 'Low';
    showModal = false; // Close the modal
  };

  // Helper function to apply status-specific colors to the status text
  const statusClass = (status) => {
    if (status === 'Resolved') return 'text-green-600';
    if (status === 'Pending') return 'text-yellow-600';
    if (status === 'Active') return 'text-blue-600';
    return 'text-gray-600';
  };


</script>

<style scoped>
  /* Add any custom styles here if needed */
</style>
