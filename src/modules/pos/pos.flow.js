import { openCartModal } from "../../ui/modals/cart.modal.js";
import { openPaymentModal } from "../../ui/modals/payment.modal.js";
import { openReceiptModal } from "../../ui/modals/receipt.modal.js";

import { createSale } from "../../app/usecases/createSale.js";
import { emitPOSRuntimeEvent } from "../../runtime/adapters/pos.runtime.adapter.js";

export function createPOSFlow() {
  const cart = {
    items: [],
    total: 0
  };

  function addProduct(p) {
    const existing = cart.items.find(i => i.id === p.id);

    if (existing) {
      existing.qty += 1;
      existing.total = existing.qty * existing.price;
    } else {
      cart.items.push({
        id: p.id,
        name: p.name,
        price: p.price,
        qty: 1,
        total: p.price
      });
    }

    cart.total = cart.items.reduce((s, i) => s + i.total, 0);

    emitPOSRuntimeEvent("pos.cart.updated", {
      items: cart.items,
      total: cart.total
    });
  }

  function startCheckout() {
    emitPOSRuntimeEvent("pos.checkout.started", {
      items: cart.items,
      total: cart.total
    });

    openCartModal(cart, () => {
      openPaymentModal(cart.total, async (payment) => {
        emitPOSRuntimeEvent("pos.payment.submitted", {
          payment,
          total: cart.total
        });

        const sale = await createSale({
          items: cart.items,
          payment
        });

        emitPOSRuntimeEvent("pos.sale.completed", {
          sale,
          items: cart.items,
          total: cart.total
        });

        openReceiptModal({
          ...sale,
          items: cart.items
        });

        reset();
      });
    });
  }

  function reset() {
    cart.items = [];
    cart.total = 0;

    emitPOSRuntimeEvent("pos.cart.reset", {});
  }

  return {
    addProduct,
    startCheckout,
    getCart: () => cart
  };
}
