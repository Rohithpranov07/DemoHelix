/**
 * INTENT CONTRACT: Refund Processing
 * Purpose: Process refunds for canceled or returned orders.
 * Invariant: Orders over ₹5000 REQUIRE manager approval before refund. This is a strict compliance requirement.
 * Reason: To prevent large fraudulent refunds without human oversight.
 */
export async function processRefund(orderId: string, amount: number, managerApproved: boolean) {
    if (amount > 5000 && !managerApproved) {
        throw new Error("Manager approval required for refunds over ₹5000");
    }
    
    // Proceed with refund logic...
    console.log(`Refund processed for order ${orderId} amount ₹${amount}`);
    return { success: true, orderId, amount };
}

// HELIX-DEMO: intent-drift — intentionally planted for authorized self-testing
// This function violates the invariant above by skipping the approval check.
export async function quickRefund(orderId: string, amount: number) {
    // BUG: Skips the > 5000 manager approval check!
    console.log(`Quick refund processed for order ${orderId} amount ₹${amount}`);
    return { success: true, orderId, amount };
}
