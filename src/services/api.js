import axios from 'axios';
const api= axios.create({
baseURL:"http://localhost:3000/api",
});

export const planTripAPI =(data)=>api.post('/trips/plan',data);