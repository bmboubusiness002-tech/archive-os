const products = [
  { id: '1', name: 'Coffee Beans 1kg', sku: 'CB-1000', price: 35, stock: 50 },
  { id: '2', name: 'Espresso Cup', sku: 'EC-001', price: 8, stock: 50 },
  { id: '3', name: 'Sugar 500g', sku: 'SG-500', price: 6, stock: 50 },
  { id: '4', name: 'Milk 1L', sku: 'MK-1L', price: 9, stock: 50 },
  { id: '5', name: 'Croissant', sku: 'CR-001', price: 12, stock: 50 },
  { id: '6', name: 'Phone Charger USB-C', sku: 'CHG-USC', price: 45, stock: 50 },
]

const cartItems = [
  { id: '1', name: 'Coffee Beans 1kg', qty: 1, price: 35 },
  { id: '6', name: 'Phone Charger USB-C', qty: 1, price: 45 },
]

const subtotal = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0)
const tax = subtotal * 0.1
const total = subtotal + tax

export function POSPage() {
  return (
    <div className="pos-page">
      <header className="pos-header">
        <div>
          <span>POS Workspace</span>
          <h2>Start Sale</h2>
          <p>First modern POS preview. Runtime binding comes after cart store extraction.</p>
        </div>
        <div className="pos-session-card">
          <span className="pulse-dot" />
          <div>
            <strong>Session ready</strong>
            <small>Main Branch · Cloud Terminal</small>
          </div>
        </div>
      </header>

      <section className="pos-workspace-grid">
        <main className="pos-products-panel">
          <div className="pos-panel-header">
            <div>
              <span>Products</span>
              <h3>Quick sale catalog</h3>
            </div>
            <input className="pos-search" placeholder="Search product or SKU" />
          </div>

          <div className="pos-product-grid">
            {products.map((product) => (
              <article className="pos-product-card" key={product.id}>
                <div className="pos-product-mark">{product.name.slice(0, 1)}</div>
                <span>{product.sku}</span>
                <h4>{product.name}</h4>
                <p>{product.stock} in stock</p>
                <div className="pos-product-footer">
                  <strong>{product.price.toFixed(2)}</strong>
                  <button>Add</button>
                </div>
              </article>
            ))}
          </div>
        </main>

        <aside className="pos-cart-panel">
          <div className="pos-panel-header compact">
            <div>
              <span>Live Cart</span>
              <h3>Current sale</h3>
            </div>
            <button className="pos-clear-button">Clear</button>
          </div>

          <div className="pos-cart-list">
            {cartItems.map((item) => (
              <div className="pos-cart-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.qty} x {item.price.toFixed(2)}</p>
                </div>
                <span>{(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pos-totals-card">
            <div><span>Subtotal</span><strong>{subtotal.toFixed(2)}</strong></div>
            <div><span>Tax</span><strong>{tax.toFixed(2)}</strong></div>
            <div className="pos-total-line"><span>Total</span><strong>{total.toFixed(2)}</strong></div>
          </div>

          <button className="pos-pay-button">Continue to Payment</button>
          <button className="pos-secondary-button">Save as Draft</button>
        </aside>
      </section>
    </div>
  )
}
