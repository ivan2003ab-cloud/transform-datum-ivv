import { globalTest, dataSnoop, signifikansi, hitungRMSETitikUji} from "@/lib/testing";

export async function POST(req) {
  try {
    const body = await req.json();

    const { v, vVar, params, xVar, n, aposteriori, titikUji, metode, avgX, avgY, avgZ } = body;

    const global = globalTest(aposteriori, n);
    const snoop = dataSnoop(v, vVar, n);
    const signif = signifikansi(params, xVar, n);
    const rmse = hitungRMSETitikUji(titikUji, params, metode, avgX, avgY, avgZ);

    return Response.json({
      global,
      snoop,
      signif,
      rmse,
    });
  } catch (err) {
    console.error("ERROR TEST:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}