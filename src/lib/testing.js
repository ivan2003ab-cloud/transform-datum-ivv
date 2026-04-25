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

export function hitungRMSETitikUji(
  titikUji,
  params,
  metode,
  avgX,
  avgY,
  avgZ,
) {
  if (!titikUji || titikUji.length === 0) {
    return {
      hasil: [],
      rmseX: null,
      rmseY: null,
      rmseZ: null,
      rmse3D: null,
      message: "Tidak ada titik uji",
    };
  }

  let [tx, ty, tz, rx, ry, rz, s] = params.map(p => p[0]);;

  // === SCALE ===
  const scale = 1 + s;

  let hasil = [];

  titikUji.forEach((row) => {
    const { x1, y1, z1, x2, y2, z2 } = row;

    let X = x1;
    let Y = y1;
    let Z = z1;

    const r11 = Math.cos(rx) * Math.cos(ry);

    const r22 =
      -Math.sin(rx) * Math.sin(ry) * Math.sin(rz) +
      Math.cos(rx) * Math.cos(rz);

    const r33 = Math.cos(rx) * Math.cos(ry);

    const Xt_local = scale * (r11 * X) + tx;
    const Yt_local = scale * (r22 * Y) + ty;
    const Zt_local = scale * (r33 * Z) + tz;

    const Xt =
      metode === "molodensky" ? Xt_local - avgX : Xt_local;

    const Yt =
      metode === "molodensky" ? Yt_local - avgY : Yt_local;

    const Zt =
      metode === "molodensky" ? Zt_local - avgZ : Zt_local;

    const dx = Xt - x2;
    const dy = Yt - y2;
    const dz = Zt - z2;

    const d = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);

    hasil.push({
      ...row,
      Xt,
      Yt,
      Zt,
      dx,
      dy,
      dz,
      d,
    });
  });

  const n = hasil.length;

  const rmseX = Math.sqrt(
    hasil.reduce((sum, r) => sum + r.dx ** 2, 0) / n
  );

  const rmseY = Math.sqrt(
    hasil.reduce((sum, r) => sum + r.dy ** 2, 0) / n
  );

  const rmseZ = Math.sqrt(
    hasil.reduce((sum, r) => sum + r.dz ** 2, 0) / n
  );

  const rmse3D = Math.sqrt(
    hasil.reduce((sum, r) => sum + r.d ** 2, 0) / n
  );

  return {
    hasil,
    rmseX,
    rmseY,
    rmseZ,
    rmse3D,
    message: "Perhitungan RMSE berhasil",
  };
}