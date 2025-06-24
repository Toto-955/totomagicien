const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Middleware pour raw body (nécessaire pour webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('⚠️ Signature webhook invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const telegramUsername = session.metadata ? session.metadata.telegramUsername : null;
    const customerEmail = session.customer_email;

    if (!telegramUsername) {
      console.log('⚠️ Pas de pseudo Telegram dans les metadata');
      return res.status(400).send('Missing telegramUsername in metadata');
    }

    try {
      const db = admin.firestore();
      const usersRef = db.collection('users');
      await usersRef.doc(telegramUsername).set({
        telegramUsername,
        pack: 'test',
        accessStart: admin.firestore.Timestamp.now(),
        email: customerEmail || null,
      });

      console.log(`Utilisateur ${telegramUsername} ajouté avec pack test`);
    } catch (err) {
      console.error('Erreur ajout Firestore:', err);
      return res.status(500).send('Erreur serveur');
    }
  }

  res.json({ received: true });
});

module.exports = router;
