import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import axios from 'axios';

const Home = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeCount, setQrCodeCount] = useState(0); // Stanje za broj QR kodova
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Stanje za modal

  // Funkcija za dohvaćanje broja QR kodova
  const fetchQrCodeCount = async () => {
    try {
      const countResponse = await axios.get('https://localhost:3000/count-qr-codes'); // Zamijeni IP adresom svog servera
      setQrCodeCount(countResponse.data.count);
    } catch (error) {
      console.error('Greška prilikom dohvaćanja broja QR kodova:', error);
    }
  };

  // Dohvati broj QR kodova kada komponenta mounta
  useEffect(() => {
    fetchQrCodeCount();
  }, []);

  // Funkcija za zatvaranje modala
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

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

      {/* QR Code Display Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Generated QR Code</DialogTitle>
        <DialogContent>
          {qrCodeUrl && (
            <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%' }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;
