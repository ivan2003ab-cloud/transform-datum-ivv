import ModelCards from "@/components/homepage_component/model_card";

export default function Page() {
  return (
    <div>

      <div>
        <h1 className="text-xl font-bold">Transformasi Datum</h1>
        <p className=" text-justify mt-4 text-black">
          Transformasi datum merupakan proses matematis yang digunakan untuk mengubah koordinat suatu titik dari satu sistem referensi geodetik (datum) ke sistem referensi lainnya. Perbedaan datum dapat disebabkan oleh perbedaan posisi pusat bumi, orientasi sumbu koordinat, maupun ukuran dan bentuk elipsoid yang digunakan, sehingga koordinat suatu titik pada datum yang berbeda tidak akan memiliki nilai yang sama.
          Website ini dirancang untuk membantu pengguna dalam melakukan proses transformasi datum secara praktis dan terstruktur. Fitur yang tersedia meliputi perhitungan parameter transformasi, pelaksanaan transformasi koordinat, serta penyimpanan parameter datum untuk digunakan kembali pada proses selanjutnya. Terdapat dua metode transformasi yang tersedia, yaitu metode Bursa-Wolf dan metode Molodensky Badekas, yang masing-masing memiliki keunggulan dan aplikasi yang berbeda tergantung pada kebutuhan pengguna.
        </p>
      </div>
      <ModelCards />
    </div>
  );
}
