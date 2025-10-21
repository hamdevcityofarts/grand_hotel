import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Intercepteur pour debugger les requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
  return config;
});

// Intercepteur pour debugger les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.url} - Succès:`, response.data);
    return response;
  },
  (error) => {
    console.log(`❌ ${error.config?.url} - Erreur:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const reservationService = {
  // Créer une réservation - CORRIGÉ
  async createReservation(reservationData) {
    try {
      console.log('📤 Données envoyées au backend:', reservationData);
      
      const response = await api.post('/reservations', reservationData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création réservation:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obtenir toutes les réservations
  async getReservations() {
    try {
      const response = await api.get('/reservations');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération réservations:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obtenir une réservation par ID
  async getReservationById(id) {
    try {
      const response = await api.get(`/reservations/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération réservation:', error.response?.data || error.message);
      throw error;
    }
  },

  // Modifier une réservation
  async updateReservation(id, reservationData) {
    try {
      const response = await api.put(`/reservations/${id}`, reservationData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur modification réservation:', error.response?.data || error.message);
      throw error;
    }
  },

  // Annuler une réservation - COMPATIBLE AVEC LES DEUX ROUTES
  async cancelReservation(id) {
    try {
      // Essayer d'abord la route /cancel (anglais)
      const response = await api.put(`/reservations/${id}/cancel`);
      return response.data;
    } catch (error) {
      // Si échec, essayer la route /annuler (français)
      console.log('🔄 Tentative avec route /annuler...');
      const response = await api.put(`/reservations/${id}/annuler`);
      return response.data;
    }
  },

  // Confirmer une réservation (admin)
  async confirmReservation(id) {
    try {
      const response = await api.put(`/reservations/${id}/confirm`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur confirmation réservation:', error.response?.data || error.message);
      throw error;
    }
  },

  // Simuler un paiement
  async mockPayment(reservationId) {
    try {
      const response = await api.post('/payments/mock', { reservationId });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur paiement:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default reservationService;