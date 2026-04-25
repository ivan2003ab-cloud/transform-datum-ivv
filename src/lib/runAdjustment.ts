export async function runAdjustment(data: any[], metode: string) {
  // 1. PREPROCESS
  const pre = await fetch("/api/preprocess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data, metode }),
  });
  const preData = await pre.json();

  // 2. ADJUSTMENT
  const adj = await fetch("/api/adjustment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      A: preData.A,
      F: preData.F,
      P: preData.P,
    }),
  });
  const adjData = await adj.json();

  // 3. TESTING
  const test = await fetch("/api/testing", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      v: adjData.v,
      vVar: adjData.vVar,
      params: adjData.params,
      xVar: adjData.xVar,
      aposteriori: adjData.aposteriori,
      n: preData.F.length,
      titikUji: preData.titikUji,
      avgX: preData.avgX,
      avgY: preData.avgY,
      avgZ: preData.avgZ,
      metode,
    }),
  });
  const testData = await test.json();

  return {
    pre: preData,
    adj: adjData,
    test: testData,
  };
}