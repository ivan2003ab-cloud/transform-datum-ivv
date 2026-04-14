import { globalTest, dataSnoop, signifikansi } from "@/lib/testing";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("BODY TEST:", body); 

    const { v, vVar, params, xVar, n, aposteriori } = body;

    if (!vVar) {
      throw new Error("vVar undefined");
    }

    const global = globalTest(aposteriori, n);
    const snoop = dataSnoop(v, vVar, n);
    const signif = signifikansi(params, xVar, n);
    console.log("BODY TEST:", snoop)

    return Response.json({
      global,
      snoop,
      signif,
    });
  } catch (err) {
    console.error("ERROR TEST:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}