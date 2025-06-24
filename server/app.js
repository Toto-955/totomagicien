const express = require('express');
const app = express();

const stripeRoutes = require('./stripe'); // ou './routes/stripe' selon ton arborescence

app.use('/', stripeRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
