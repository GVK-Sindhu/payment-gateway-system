class PaymentGateway {
  constructor(opts) {
    this.opts = opts;
  }

  open() {
    const modal = document.createElement('div');
    modal.id = 'payment-gateway-modal';
    modal.setAttribute('data-test-id', 'payment-modal');

    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <iframe
            data-test-id="payment-iframe"
            src="http://localhost:3001/checkout?order_id=${this.opts.orderId}&embedded=true">
          </iframe>
          <button data-test-id="close-modal-button">×</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    window.addEventListener('message', (e) => {
      if (e.data.type === 'payment_success') {
        this.opts.onSuccess?.(e.data.data);
        modal.remove();
      }
      if (e.data.type === 'payment_failed') {
        this.opts.onFailure?.(e.data.data);
      }
      if (e.data.type === 'close_modal') {
        modal.remove();
        this.opts.onClose?.();
      }
    });
  }
}

window.PaymentGateway = PaymentGateway;
