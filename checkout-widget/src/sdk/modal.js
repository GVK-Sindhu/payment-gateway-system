export function createModal(orderId) {
  if (document.getElementById('payment-gateway-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'payment-gateway-modal';
  modal.setAttribute('data-test-id', 'payment-modal');

  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <iframe
          data-test-id="payment-iframe"
          src="http://localhost:3001/checkout.html?order_id=${orderId}"
        ></iframe>
        <button
          data-test-id="close-modal-button"
          class="close-button"
        >×</button>
      </div>
    </div>
  `;

  modal
    .querySelector('.close-button')
    .addEventListener('click', () => {
      window.postMessage({ type: 'close_modal' }, '*');
    });

  document.body.appendChild(modal);
}

export function removeModal() {
  const modal = document.getElementById('payment-gateway-modal');
  if (modal) modal.remove();
}
