import { hitungPerataan, hitungResidu, varkov } from "@/lib/adjustment";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("BODY ADJ:", body);

    const { A, F, P } = body;

    if (!Array.isArray(A)) {
      throw new Error("A masih bukan array ❌");
    }

    const { params, Q } = hitungPerataan(A, F, P);
    const { v, aposteriori } = hitungResidu(A, F, params, P);
    const { xVar, vVar } = varkov(aposteriori, Q, P, A);

    return Response.json({
      params,
      Q,
      v,
      aposteriori,
      xVar,
      vVar,
    });
  } catch (err) {
    console.error("ERROR ADJUSTMENT:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}