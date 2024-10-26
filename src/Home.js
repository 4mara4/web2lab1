import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import axios from 'axios';

const Home = () => {
  const [qrCodeCount, setQrCodeCount] = useState(0); // Stanje za broj QR kodova

  const externalUrl = process.env.RENDER_EXTERNAL_URL;

  // Funkcija za dohvaćanje broja QR kodova
  const fetchQrCodeCount = async () => {
    try {
      const countResponse = await axios.get(`${externalUrl}/count-qr-codes`); 
      setQrCodeCount(countResponse.data.count);
    } catch (error) {
      console.error('Greška prilikom dohvaćanja broja QR kodova:', error);
    }
  };

  // Dohvati broj QR kodova kada komponenta mounta
  useEffect(() => {
    fetchQrCodeCount();
  }, []);


  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      textAlign="center"
    >
      <Typography variant="h1" gutterBottom>
        Welcome!
      </Typography>
      <Typography variant="h5" gutterBottom>
        QR codes generated:
      </Typography>
      <Paper
        elevation={3}
        sx={{
          backgroundColor: 'green',
          color: 'white',
          padding: '20px',
          width: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '20px 0',
        }}
      >
        <Typography variant="h4">{qrCodeCount}</Typography>
      </Paper>
      <Typography variant="body1" sx={{ marginTop: 2 }}>
        QR codes are generated through API requests only.
      </Typography>
    </Box>
  );
};

export default Home;
