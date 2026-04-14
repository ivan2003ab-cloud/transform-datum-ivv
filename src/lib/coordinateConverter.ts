// =======================
// DMS (DD.MMSSSS) → DD
// =======================
export function dmsDecimalToDD(value: number) {
  const deg = Math.floor(value);
  const remainder = (value - deg) * 100;

  const min = Math.floor(remainder);
  const sec = (remainder - min) * 100;

  return deg + min / 60 + sec / 3600;
}

// =======================
// DD → DMS (DD.MMSSSS)
// =======================
export function ddToDmsDecimal(dd: number) {
  const deg = Math.floor(dd);
  const minFloat = (dd - deg) * 60;

  const min = Math.floor(minFloat);
  const sec = (minFloat - min) * 60;

  return deg + min / 100 + sec / 10000;
}

// =======================
// Geodetik → ECEF
// =======================
export function geodeticToECEF(
  lat: number,
  lon: number,
  h: number = 0
) {
  const a = 6378137;
  const e2 = 0.00669437999014;

  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2);

  const X = (N + h) * Math.cos(latRad) * Math.cos(lonRad);
  const Y = (N + h) * Math.cos(latRad) * Math.sin(lonRad);
  const Z = (N * (1 - e2) + h) * Math.sin(latRad);

  return { X, Y, Z };
}

// =======================
// ECEF → Geodetik 
// =======================
export function ecefToGeodetic(X: number, Y: number, Z: number) {
  const a = 6378137;
  const e2 = 0.00669437999014;

  const lon = Math.atan2(Y, X);
  const p = Math.sqrt(X * X + Y * Y);

  let lat = Math.atan2(Z, p * (1 - e2));
  let latPrev;

  do {
    latPrev = lat;
    const N = a / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);
    lat = Math.atan2(Z + e2 * N * Math.sin(lat), p);
  } while (Math.abs(lat - latPrev) > 1e-12);

  const N = a / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);
  const h = p / Math.cos(lat) - N;

  return {
    lat: (lat * 180) / Math.PI,
    lon: (lon * 180) / Math.PI,
    h,
  };
}

// =======================
// NORMALIZE (INPUT → CARTESIAN)
// =======================
export function normalizeToCartesian(data: any[], struktur: string) {
  return data.map((row) => {
    if (struktur === "cartesian") {
      return row;
    }

    if (struktur === "dd") {
      const p1 = geodeticToECEF(row.lat1, row.lon1, row.h1 || 0);
      const p2 = geodeticToECEF(row.lat2, row.lon2, row.h2 || 0);

      return {
        point: row.point,
        x1: p1.X,
        y1: p1.Y,
        z1: p1.Z,
        x2: p2.X,
        y2: p2.Y,
        z2: p2.Z,
      };
    }

    if (struktur === "dms") {
      const lat1 = dmsDecimalToDD(row.lat1);
      const lon1 = dmsDecimalToDD(row.lon1);

      const lat2 = dmsDecimalToDD(row.lat2);
      const lon2 = dmsDecimalToDD(row.lon2);

      const p1 = geodeticToECEF(lat1, lon1, row.h1 || 0);
      const p2 = geodeticToECEF(lat2, lon2, row.h2 || 0);

      return {
        point: row.point,
        x1: p1.X,
        y1: p1.Y,
        z1: p1.Z,
        x2: p2.X,
        y2: p2.Y,
        z2: p2.Z,
      };
    }

    return row;
  });
}

// =======================
// CARTESIAN → GEODETIK
// =======================
export function cartesianToGeodetic(data: any[]) {
  return data.map((row) => {
    const p1 = ecefToGeodetic(row.x1, row.y1, row.z1);
    const p2 = ecefToGeodetic(row.x2, row.y2, row.z2);

    return {
      point: row.point,

      lat1: p1.lat,
      lon1: p1.lon,
      h1: p1.h,

      lat2: p2.lat,
      lon2: p2.lon,
      h2: p2.h,
    };
  });
}