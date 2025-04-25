<template>
    
  <div class="min-h-screen bg-white">
      <div class="flex">
          <!-- Main Content -->
          <main class="flex-1 p-8 bg-gray-50 ">
              <div class="mb-6 flex justify-between items-center">
                  <h1 class="text-3xl font-bold text-gray-600">Manage Roles</h1>
                  <button @click="openModal" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                      Add Roles
                  </button>
              </div>
  
              <!-- New Ticket Modal -->
              <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                  <div class="bg-white p-6 rounded-lg shadow-md max-w-lg w-full">
                      <h3 class="text-xl font-semibold text-gray-700">Create New Roles</h3>
                      <form @submit.prevent="createTicket" class="space-y-4 mt-4">
                          <div>
                              <label for="customerName" class="block text-gray-700">Role Name</label>
                              <input v-model="newTicket.customerName" id="customerName" type="text" class="w-full p-2 border border-gray-300 rounded-md text-gray-700"/>
                          </div>
                        
                        
                          <div class="flex justify-end space-x-2">
                              <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                  Create
                              </button>
                              <button @click="closeModal" class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500">
                                  Cancel
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
  
              <!-- Ticket List Table -->
              <div class="bg-white p-6 rounded-lg shadow-md mt-8">
                  <h3 class="text-xl font-semibold text-gray-700"></h3>
                  <table class="min-w-full mt-4">
                      <thead>
                          <tr class="text-left border-b text-lg text-gray-700">
                              <th class="py-3 px-4">Role Name</th>
                              <!-- <th class="py-3 px-4">Supervisor</th> -->
                              <th class="py-3 px-4">Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-for="ticket in tickets" :key="ticket.ticketId" class="border-b text-gray-700 font-semibold">
                              <td class="py-3 px-4">{{ ticket.roleName }}</td>
                              <!-- <td class="py-3 px-4">{{ ticket.supervisor }}</td> -->
                              <td class="py-3 px-6 flex space-x-6">
                         
                                  <button @click="openModal" 
                                  class="text-blue-500 font-semibold hover:underline shadow-xs ">Update Permission</button>
                                  <button class="font-semibold text-red-400 hover:underline shadow-xs">Edit</button>
                              </td>
                          </tr>

                          <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                          <div class="bg-white p-6 rounded-lg shadow-md max-w-lg w-full">
                              <h3 class="text-xl font-semibold text-gray-700">Create New Roles</h3>
                              <form @submit.prevent="createTicket" class="space-y-4 mt-4">
                                  <div>
                                      <label for="customerName" class="block text-gray-700">Permission Name</label>
                                      <input v-model="newTicket.customerName" id="customerName" type="text" class="w-full p-2 border border-gray-300 rounded-md text-gray-700"/>
                                  </div>
                                
                                
                                  <div class="flex justify-end space-x-2">
                                      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                          Create
                                      </button>
                                      <button @click="closeModal" class="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500">
                                          Cancel
                                      </button>
                                  </div>
                              </form>
                          </div>
              </div>
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

  const openModalPermission = () => {
    showModalPermission.value = true;
  }

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
      { roleName: 'Administrator', supervisor: 'System Administrator'},
      { roleName: 'Read-only Account', supervisor: 'Administrator' },
      { roleName: 'Developer', supervisor: 'System Administrator' },
      { roleName: 'Voucher Pin Entry', supervisor: 'Administrator' },
      { roleName: 'Customer Service', supervisor: 'Order Administrator' },
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
  
  