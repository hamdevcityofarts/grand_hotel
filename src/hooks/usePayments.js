// hooks/usePayments.js
import { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';

export const usePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getPayments();
      setPayments(response.payments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return { payments, loading, error, refetch: fetchPayments };
};

export const usePaymentStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getPaymentStats();
      setStats(response.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error };
};

export const usePayment = (id) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getPaymentById(id);
      setPayment(response.payment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPayment();
    }
  }, [id]);

  return { payment, loading, error, refetch: fetchPayment };
};