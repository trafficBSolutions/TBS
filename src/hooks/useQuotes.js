import { useState, useEffect } from 'react';
import axios from 'axios';

export const useQuotes = (isAdmin, allowedForQuotes) => {
  const [quotesDate, setQuotesDate] = useState(new Date());
  const [quotesList, setQuotesList] = useState([]);
  const [quotesMonthly, setQuotesMonthly] = useState({});
  const [resendingQuoteId, setResendingQuoteId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchMonthlyQuotes = async (date) => {
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const res = await axios.get(`/api/quotes/month?month=${month}&year=${year}`);
      const grouped = {};
      (res.data || []).forEach(q => {
        if (q.date) (grouped[q.date] ||= []).push(q);
      });
      setQuotesMonthly(grouped);
    } catch (e) {
      setQuotesMonthly({});
    }
  };

  const fetchQuotesForDay = async (date) => {
    if (!date) return;
    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await axios.get(`/api/quotes/day?date=${dateStr}`);
      setQuotesList(res.data || []);
    } catch (e) {
      setQuotesList([]);
    }
  };

  const resendQuote = async (quoteId) => {
    setResendingQuoteId(quoteId);
    try {
      await axios.post(`/api/quotes/${quoteId}/resend`);
      await fetchQuotesForDay(quotesDate);
      setSuccessMessage('Quote resent successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setSuccessMessage('Failed to resend quote');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setResendingQuoteId(null);
    }
  };

  useEffect(() => {
    if (quotesDate && allowedForQuotes) {
      fetchMonthlyQuotes(quotesDate);
      fetchQuotesForDay(quotesDate);
    }
  }, [quotesDate, allowedForQuotes]);

  return {
    quotesDate, setQuotesDate,
    quotesList, quotesMonthly,
    resendingQuoteId, successMessage,
    fetchMonthlyQuotes, fetchQuotesForDay, resendQuote
  };
};

export default useQuotes;
