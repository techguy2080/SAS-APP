import axios from '../utils/axiosConfig';

const API = '/payments';

export const getPayments = () => axios.get(API);
export const getPaymentById = (id) => axios.get(`${API}/${id}`);
export const createPayment = (data) => axios.post(API, data);
export const updatePayment = (id, data) => axios.put(`${API}/${id}`, data);
export const deletePayment = (id) => axios.delete(`${API}/${id}`);