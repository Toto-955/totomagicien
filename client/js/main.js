const stripe = Stripe('pk_test_...');
document.querySelectorAll('.buy-button').forEach(button => {
button.addEventListener('click', async () => {
const priceId = button.getAttribute('data-price-id');
const response = await fetch('http://localhost:4242/create-checkout-session', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ priceId })
});
const session = await response.json();
const result = await stripe.redirectToCheckout({ sessionId: session.id });
if (result.error) alert(result.error.message);
});
});