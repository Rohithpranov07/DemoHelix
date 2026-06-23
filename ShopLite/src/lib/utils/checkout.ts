// HELIX-DEMO: entropy — intentionally planted for authorized self-testing
// Duplicated logic #1: calculate order total
export function calculateOrderTotal(items: { price: number, quantity: number }[]) {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
    }
    const tax = total * 0.18; // 18% tax
    return total + tax;
}
