import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography } from '@mui/material';

const TicketDetails = () => {
  const { id } = useParams(); // Uzmi ticketId iz URL-a
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const response = await axios.get(`https://localhost:3000/ticket/${id}`);
        setTicket(response.data);
      } catch (error) {
        console.error('Greška prilikom dohvaćanja podataka o ulaznici:', error);
        setError('Greška prilikom dohvaćanja podataka o ulaznici.');
      }
    };

    fetchTicketDetails();
  }, [id]);

  if (error) {
    return (
      <Box textAlign="center">
        <Typography variant="h4" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box textAlign="center">
        <Typography variant="h4">Loading ticket details...</Typography>
      </Box>
    );
  }

  return (
    <Box textAlign="center">
      <Typography variant="h3">Ticket Details</Typography>
      <Typography variant="h6">OIB: {ticket.oib}</Typography>
      <Typography variant="h6">Name: {ticket.ime}</Typography>
      <Typography variant="h6">Surname: {ticket.prezime}</Typography>
      <Typography variant="h6">Created at: {new Date(ticket.created_at).toLocaleString()}</Typography>
    </Box>
  );
};

export default TicketDetails;