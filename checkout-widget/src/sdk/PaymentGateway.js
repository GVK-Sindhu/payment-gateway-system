import { createModal, removeModal } from './modal';
import './styles.css';

class PaymentGateway {
  constructor(options) {
    if (!options || !options.key || !options.orderId) {
      throw new Error('key and orderId are required');
    }

    this.key = options.key;
    this.orderId = options.orderId;
    this.onSuccess = options.onSuccess || (() => {});
    this.onFailure = options.onFailure || (() => {});
    this.onClose = options.onClose || (() => {});

    this.handleMessage = this.handleMessage.bind(this);
  }

  open() {
    createModal(this.orderId);
    window.addEventListener('message', this.handleMessage);
  }

  close() {
    removeModal();
    window.removeEventListener('message', this.handleMessage);
    this.onClose();
  }

  handleMessage(event) {
    if (!event.data || !event.data.type) return;

    if (event.data.type === 'payment_success') {
      this.onSuccess(event.data.data);
      this.close();
    }

    if (event.data.type === 'payment_failed') {
      this.onFailure(event.data.data);
    }

    if (event.data.type === 'close_modal') {
      this.close();
    }
  }
}

window.PaymentGateway = PaymentGateway;
export default PaymentGateway;
