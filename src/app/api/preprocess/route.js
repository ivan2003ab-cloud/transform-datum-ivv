import { bwMatrix } from "@/lib/preprocess";

export async function POST(req) {
  const { data,metode } = await req.json();

  const result = bwMatrix(data, metode);

  return Response.json(result);
}