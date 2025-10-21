// services/paymentService.js


class PaymentService {
  // 🔹 Obtenir tous les paiements (Admin)
  async getPayments() {
    try {
      const response = await api.get('/payments');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des paiements');
    }
  }

  // 🔹 Obtenir les statistiques
  async getPaymentStats() {
    try {
      const response = await api.get('/payments/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // 🔹 Obtenir un paiement par ID
  async getPaymentById(id) {
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Paiement non trouvé');
    }
  }

  // 🔹 Traiter un paiement
  async processPayment(paymentData) {
    try {
      const response = await api.post('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors du traitement du paiement');
    }
  }

  // 🔹 Simulation de paiement
  async mockPayment(reservationId, amount = null) {
    try {
      const response = await api.post('/payments/mock', {
        reservationId,
        amount
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la simulation');
    }
  }

  // 🔹 Remboursement
  async refundPayment(paymentId, amount = null, reason = '') {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, {
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors du remboursement');
    }
  }

  // 🔹 Télécharger reçu
  async downloadReceipt(paymentId) {
    try {
      const response = await api.get(`/payments/${paymentId}/receipt`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement');
    }
  }
}

export default new PaymentService();