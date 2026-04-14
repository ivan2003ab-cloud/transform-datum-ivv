// /lib/adjustment.js
import { create, all } from "mathjs";
const math = create(all);

export function hitungPerataan(A, F, P) {
 
  const Am = math.matrix(A);
  const Fm = math.matrix(F);
  const Pm = math.matrix(P);

  const AT = math.transpose(Am);

  const Q = math.inv(math.multiply(AT, Pm, Am));
  const minQ = math.multiply(-1, Q);
  const range = math.multiply(AT, Pm, Fm);
  const params = math.multiply(minQ, range);

  return {
    params: params.toArray(),
    Q: Q.toArray(),
  };
}

export function hitungResidu(A, F, params, P) {
 
  const Am = math.matrix(A);
  const Fm = math.matrix(F);
  const Xm = math.matrix(params);
  const Pm = math.matrix(P);

  const v = math.add(math.multiply(Am, Xm), Fm);
  const vT = math.transpose(v);

  const n = v.size()[0];

  const aposteriori = math.squeeze(
    math.divide(math.multiply(vT, Pm, v), n - 1)
  );

  return {
    v: v.toArray(),
    aposteriori,
  };
}

export function varkov(aposteriori, Q, P, A) {
  // 🔥 FIX: convert ke matrix
  const Qm = math.matrix(Q);
  const Pm = math.matrix(P);
  const Am = math.matrix(A);

  const xVar = math.multiply(aposteriori, Qm);

  const invP = math.inv(Pm);
  const temp = math.multiply(Am, Qm, math.transpose(Am));

  const vVar = math.multiply(aposteriori, math.subtract(invP, temp));

  return {
    xVar: xVar.toArray(),
    vVar: vVar.toArray(),
  };
}