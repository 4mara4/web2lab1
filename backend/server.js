const express = require('express');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const { expressjwt : jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const ejs = require('ejs');
const {auth, requiresAuth} = require('express-openid-connect');

require('dotenv').config();
const app = express();
const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;

// Middleware za parsiranje JSON tijela zahtjeva
app.use(bodyParser.json());
app.use(cors());
app.set('view engine', 'ejs');

app.use(
    auth({
        authRequired: false,
        auth0Logout: true,
        secret: process.env.SECRET,
        baseURL:  externalUrl || `https://localhost:${port}`,
        clientID: process.env.AUTH0_CLIENT_ID,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        routes: {
            login: false,
            callback: '/callback' // Explicit callback route
        }
    })
);

// Postavljanje veze s bazom podataka
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Definiraj JWT middleware za autentifikaciju
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksUri: `${process.env.ISSUER_BASE_URL}/.well-known/jwks.json`,
    }),
    audience: process.env.API_AUDIENCE,
    issuer: `${process.env.ISSUER_BASE_URL}/`,
    algorithms: ['RS256'],
});

app.get('/count-qr-codes', async (req, res) => {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM codes');
      const count = parseInt(result.rows[0].count);
      res.status(200).json({ count });
    } catch (error) {
      console.error('Greška prilikom dobivanja broja QR kodova:', error);
      res.status(500).json({ message: 'Greška prilikom dobivanja broja QR kodova' });
    }
  });

// Endpoint za generiranje QR koda (zaštićen autentifikacijom)
app.post('/generate-qr', checkJwt, async (req, res) => {
    const { oib, ime, prezime } = req.body;
    console.log("Token received:", req.headers.authorization);

    // Provjera jesu li svi podaci prisutni
    if (!oib || !ime || !prezime) {
        return res.status(400).json({ message: 'Sva polja su obavezna: OIB, ime, prezime' });
    }

    try {
        // Provjeri postoji li već 3 QR koda za isti OIB
        const result = await pool.query('SELECT COUNT(*) FROM codes WHERE oib = $1', [oib]);
        const count = parseInt(result.rows[0].count);

        if (count >= 3) {
            return res.status(400).json({ message: 'Already created three QR codes for this OIB!' });
        }

        const qrCodeId = uuidv4(); // Jedinstveni identifikator za QR kod
        const ticketUrl = `https://localhost:3000/ticket/${qrCodeId}`;

        // Generiraj QR kod s URL-om ulaznice
        const qrCodeUrl = await QRCode.toDataURL(ticketUrl);

        // Spremi podatke u bazu
        await pool.query(
            'INSERT INTO codes (qrCode, oib, ime, prezime) VALUES ($1, $2, $3, $4)',
            [qrCodeId, oib, ime, prezime]
        );

        const qrCodeImage = await QRCode.toBuffer(ticketUrl, { type: 'png' });
        const base64QRCode = qrCodeImage.toString("base64");

        res.type('png').send(qrCodeImage);
        //res.render('qrcode', { qrCode: `data:image/png;base64,${base64QRCode}` });
    } catch (error) {
        console.error('There was an error generating the QR code:', error);
        res.status(500).json({ message: 'Error generating QR code.' });
    }
});

// Endpoint za prikaz podataka o ulaznici
app.get('/ticket/:id', requiresAuth(), async (req, res) => {
    const { id } = req.params;

    try {
        // Dohvati podatke o ulaznici iz baze koristeći ID ulaznice
        const result = await pool.query('SELECT oib, ime, prezime, created_at FROM codes WHERE qrCode = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('There was an error fetching the ticket:', error);
        res.status(500).json({ message: 'Error fetching ticket.' });
    }
});

if (externalUrl) {
    const hostname = '0.0.0.0'; //ne 127.0.0.1
    app.listen(port, hostname, () => {
    console.log(`Server locally running at http://${hostname}:${port}/ and from 
    outside on ${externalUrl}`);
    });
    }
    else {
    https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
    }, app)
    .listen(port, function () {
    console.log(`Server running at https://localhost:${port}/`);
    });
}