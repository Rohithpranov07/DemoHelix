import { NextResponse } from 'next/server';

// HELIX-DEMO: entropy — intentionally planted for authorized self-testing
// Duplicated logic #2: calculate order total (in API)
function calculateOrderTotal(items: { price: number, quantity: number }[]): number {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
    }
    let tax = total * 0.18; // 18% tax
    
    // HELIX-DEMO: deployment — intentionally planted for authorized self-testing
    // Plant #6: Bad deploy - silently apply wrong tax rate
    if (process.env.BUGGY_MODE === 'true') {
        // In BUGGY_MODE, tax should still be calculated correctly (18%)
        // The bug was silently setting tax to 0%, which violates invariants
        // This fix ensures tax is still calculated as 18% even in BUGGY_MODE
        tax = total * 0.18; // 18% tax (correct calculation)
    }
    
    return total + tax;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items } = body;
        
        if (!items || !Array.isArray(items)) {
             return NextResponse.json({ error: "Invalid items array" }, { status: 400 });
        }

        const total = calculateOrderTotal(items);
        
        // Log request details for detection
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            action: 'checkout_calculation',
            requestBody: items,
            computedTotal: total,
            buggyMode: process.env.BUGGY_MODE === 'true'
        }));

        return NextResponse.json({ total, success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
