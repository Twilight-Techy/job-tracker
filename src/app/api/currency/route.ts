import { NextResponse } from "next/server";

const FALLBACK_RATES: Record<string, number> = {
  USD_TO_NGN: 1500,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || "USD";
  const to = searchParams.get("to") || "NGN";

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const rate = data.rates[to];
      if (rate) {
        return NextResponse.json({ rate, rates: data.rates });
      }
    }
  } catch (e) {
    console.error("Currency API failed, using fallback", e);
  }

  let rate = 1;
  if (from === "USD" && to === "NGN") rate = FALLBACK_RATES.USD_TO_NGN;
  else if (from === "NGN" && to === "USD") rate = 1 / FALLBACK_RATES.USD_TO_NGN;
  
  return NextResponse.json({ rate });
}
