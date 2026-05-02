// /api/preprocess.js
import { create, all } from "mathjs";
const math = create(all);

export function bwMatrix(data, metode) {
  let A = [];
  let F = [];
  let P = [];

  // === 1. PISAH DATA ===
  const dataSekutu = data.filter(
    row => row.status?.toLowerCase().trim() === "sekutu" && row.selected === "selected"
  );
  const dataUji = data.filter(
    row => row.status?.toLowerCase().trim() === "uji"
  );

  // === 2. HITUNG RATA2 (HANYA SEKUTU) ===
  const avgX = math.mean(dataSekutu.map(row => row.x1));
  const avgY = math.mean(dataSekutu.map(row => row.y1));
  const avgZ = math.mean(dataSekutu.map(row => row.z1));

  // === 3. BANGUN MATRIKS ===
  dataSekutu.forEach((row) => {
    const { x1, y1, z1, x2, y2, z2 } = row;
    let X = x1, Y = y1, Z = z1;

    if (metode === "molodensky") {
      X = x1 - avgX;
      Y = y1 - avgY;
      Z = z1 - avgZ;
    }

    A.push([1, 0, 0, 0, -Z, Y, X]);
    A.push([0, 1, 0, Z, 0, -X, Y]);
    A.push([0, 0, 1, -Y, X, 0, Z]);

    F.push(X - x2);
    F.push(Y - y2);
    F.push(Z - z2);

    if (row.sx2) {
      P.push(1 / (row.sx2 ** 2));
      P.push(1 / (row.sy2 ** 2));
      P.push(1 / (row.sz2 ** 2));
    }
  });

  const A_m = math.matrix(A);
  const F_m = math.reshape(math.matrix(F), [F.length, 1]);

  const P_m = P.length
    ? math.diag(P)
    : math.identity(dataSekutu.length * 3);
  return {
    A: A_m.toArray(),
    F: F_m.toArray(),
    P: P_m.toArray(),
    avgX,
    avgY,
    avgZ,
    titikUji: dataUji,
    titikSekutu: dataSekutu,
  };
}