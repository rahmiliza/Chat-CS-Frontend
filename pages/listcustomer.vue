<template>

<div class="min-h-screen bg-gray-100">
    <div class="flex">
        <!-- Main Content -->
        <main class="flex-1 p-8">
            <div class="mb-6 flex justify-between items-center">
                <h1 class="text-3xl font-bold text-gray-600">CUSTOMERS</h1>
                <button @click="openModal" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Add Customer
                </button>
            </div>

            <!-- New Ticket Modal -->
            <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                <div class="bg-white p-6 rounded-lg shadow-md max-w-lg w-full">
                    <h3 class="text-xl font-semibold text-gray-700">Add Customer</h3>
                    <form @submit.prevent="createTicket" class="space-y-4 mt-4">
                        <div>
                            <label for="customerName" class="block text-gray-700">Customer Name</label>
                            <input v-model="newTicket.customerName" id="customerName" type="text" class="w-full p-2 border border-gray-300 rounded-md text-gray-700"/>
                        </div>
                        <div>
                            <label for="issueDescription" class="block text-gray-700">Issue Description</label>
                            <textarea v-model="newTicket.issueDescription" id="issueDescription" class="w-full p-2 border border-gray-300 rounded-md text-gray-700" rows="4"></textarea>
                        </div>
                        <div>
                            <label for="priority" class="block text-gray-700">Priority</label>
                            <select v-model="newTicket.priority" id="priority" class="w-full p-2 border border-gray-300 rounded-md text-gray-700">
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

            <!-- Ticket List Table -->
            <div class="bg-white p-6 rounded-lg shadow-md mt-8">
                <h3 class="text-xl font-semibold text-gray-700"></h3>
                <table class="min-w-full mt-4">
                    <thead>
                        <tr class="text-left border-b text-gray-600">
                            <th class="py-3 px-4">Member ID</th>
                            <th class="py-3 px-4">Customer</th>
                            <th class="py-3 px-4">Phone Number</th>
                            <th class="py-3 px-4">Status</th>
                            <th class="py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="customer in customers" :key="customer.customerId" class="border-b text-gray-600">
                            <td class="py-3 px-4">{{ customer.customerId }}</td>
                            <td class="py-3 px-4">{{ customer.customerName }}</td>
                            <td class="py-3 px-4">{{ customer.phoneCustomer }}</td>
                            <td class="py-3 px-4" :class="statusClass(customer.status)">{{ customer.status }}</td>
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
  const customers = [
    { customerId: 'HZ1231121', customerName: 'John Doe', phoneCustomer:'+886984453672' , status: 'Active' },
    { customerId: 'HZ1232122', customerName: 'Jane Smith', phoneCustomer:'+886984343670' , status: 'Active'  },
    { customerId: 'HZ1233125', customerName: 'Alice Johnson', phoneCustomer:'+886984445672' , status: 'Active' },
    { customerId: 'HZ1234123', customerName: 'Bob Brown', phoneCustomer:'+886984453672' , status: 'Active' },
    { customerId: 'HZ1235234', customerName: 'Charlie Davis', phoneCustomer:'+886984453672' , status: 'Active' },
    { customerId: 'HZ1236235', customerName: 'David Wilson', phoneCustomer:'+886984453672' , status: 'Active' },
    { customerId: 'HZ1237657', customerName: 'Eve Miller', phoneCustomer:'+886984453672' , status: 'Active'},
    { customerId: 'HZ1238868', customerName: 'Frank White', phoneCustomer:'+886984453672' , status: 'Active' },
    { customerId: 'HZ1239686', customerName: 'Grace Lee', phoneCustomer:'+886984453672' , status: 'Active' },
    { customerId: 'HZ3453563', customerName: 'Henry Hall', phoneCustomer:'+886984453672' , status: 'Active'},
  ];

  // New Ticket form data
  const newTicket = {
    customerName: '',
    issueDescription: '',
    priority: 'Low',
  };




  // Ticket counts
  const activeTickets = customers.filter(customer => customer.status === 'Active').length;
  const resolvedTickets = customers.filter(customer => customer.status === 'Resolved').length;
  const pendingTickets = customers.filter(customer => customer.status === 'Pending').length;

  // Add new customer to the customers list
  const createTicket = () => {
    const newTicketData = {
      customerId: `#${(customers.length + 1).toString().padStart(3, '0')}`,
      customerName: newTicket.customerName,
      status: 'Pending',
      priority: newTicket.priority,
      createdAt: new Date().toLocaleDateString(),
    };

    // Add new customer to the customers array
    customers.push(newTicketData);

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

