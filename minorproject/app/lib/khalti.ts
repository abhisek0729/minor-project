import { khalti } from "@paybridgejs/khalti";

const KHALTI_SECRET_KEY =
  process.env.KHALTI_SECRET_KEY || "0b46a5d02dd8417cb150bc03c5c903fe";

// Base URL for callback redirects
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

// Paybridge Khalti Client
export const khaltiClient = new khalti({
  secretKey: KHALTI_SECRET_KEY,
});

export interface KhaltiInitiateParams {
  return_url: string;
  website_url: string;
  amount: number; // in paisa (NPR 100 = 10000 paisa) or NPR depending on handler
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info?: {
    name: string;
    email: string;
    phone: string;
  };
  amount_break_down?: Array<{
    label: string;
    amount: number;
  }>;
  product_details?: Array<{
    identity: string;
    name: string;
    total_price: number;
    quantity: number;
    unit_price: number;
  }>;
}

export interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at?: string;
  expires_in?: number;
}

export interface KhaltiVerifyResponse {
  pidx: string;
  total_amount: number;
  status: "Completed" | "Pending" | "Initiated" | "Refunded" | "Expired" | "User canceled";
  transaction_id?: string;
  fee?: number;
  refunded?: boolean;
}

/**
 * Initiates payment via PayBridge SDK with direct Khalti API fallback
 */
export async function initiateKhaltiPayment(
  params: KhaltiInitiateParams
): Promise<KhaltiInitiateResponse> {
  // Try Paybridge SDK first
  try {
    const res = await khaltiClient.initiate({
      return_url: params.return_url,
      website_url: params.website_url,
      amount: params.amount, // in paisa
      purchase_order_id: params.purchase_order_id,
      purchase_order_name: params.purchase_order_name,
    });

    if (res && res.pidx && res.payment_url) {
      return res as KhaltiInitiateResponse;
    }
  } catch (sdkErr) {
    console.warn("Paybridge SDK initiate error, attempting direct Khalti API:", sdkErr);
  }

  // Direct Khalti ePayment v2 API fallback
  const response = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
    method: "POST",
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      return_url: params.return_url,
      website_url: params.website_url,
      amount: params.amount, // paisa
      purchase_order_id: params.purchase_order_id,
      purchase_order_name: params.purchase_order_name,
      customer_info: params.customer_info || {
        name: "Traveler",
        email: "traveler@travelnepal.com",
        phone: "9800000000",
      },
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.pidx) {
    throw new Error(data.detail || data.message || "Failed to initiate Khalti payment");
  }

  return {
    pidx: data.pidx,
    payment_url: data.payment_url,
    expires_at: data.expires_at,
    expires_in: data.expires_in,
  };
}

/**
 * Verifies payment via PayBridge SDK with direct Khalti Lookup API fallback
 */
export async function verifyKhaltiPayment(
  pidx: string
): Promise<KhaltiVerifyResponse> {
  // Try Paybridge SDK first
  try {
    const res = await khaltiClient.verify({ pidx });
    if (res && res.status) {
      return res as KhaltiVerifyResponse;
    }
  } catch (sdkErr) {
    console.warn("Paybridge SDK verify error, attempting direct Khalti Lookup API:", sdkErr);
  }

  // Direct Khalti ePayment v2 Lookup API fallback
  const response = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
    method: "POST",
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new Error(data.detail || data.message || "Failed to verify Khalti payment");
  }

  return {
    pidx: data.pidx,
    total_amount: data.total_amount,
    status: data.status,
    transaction_id: data.transaction_id || pidx,
    fee: data.fee,
    refunded: data.refunded,
  };
}
