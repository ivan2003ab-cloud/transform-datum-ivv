// /api/testing.js
import { jStat } from "jstat";
import { create, all } from "mathjs";

const math = create(all);
export function globalTest(aposteriori, n) {
  const r = n - 1;

  const Xhitung = r * aposteriori;
  const Xtabel = jStat.chisquare.inv(0.95, r);

  const result = Xhitung <= Xtabel ? 1 : 0;

  return {
    result,
    aposteriori,
    Xhitung,
    Xtabel,
  };
}

export function dataSnoop(v, vVar, n) {
  const r = n - 1;

  const vDiag = math.diag(vVar);
  const sqrtDiag = vDiag.map((val) => Math.sqrt(val));

  const w = v.map((val, i) => val / sqrtDiag[i]);
  const wAbs = w.map(Math.abs);
  const fTabel = jStat.centralF.inv(0.95, r, 1000);

  const result = wAbs.map((val) => (val <= fTabel ? 1 : 0));

  return { sqrtDiag, w, result, fTabel};
}

export function signifikansi(params, xVar, n) {
  const r = n - 1;

  const diag = math.diag(xVar);
  const sqrtDiag = diag.map((val) => Math.sqrt(val));
  const w = params.map((val, i) => val / sqrtDiag[i]);
  const wAbs = w.map(Math.abs);

  const tTabel = jStat.studentt.inv(0.95, r);

  const result = wAbs.map((val) => (val >= tTabel ? 1 : 0));

  return { diag, sqrtDiag, w, wAbs, result };
}