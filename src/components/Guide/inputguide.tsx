import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startInputGuide = () => {
  const driverObj = driver({
    showProgress: true,

    animate: true,
    smoothScroll: true,
    stagePadding: 12,
  popoverOffset: 16,
    nextBtnText: "Lanjut",
    prevBtnText: "Kembali",
    doneBtnText: "Selesai",

    steps: [
      {
        element: "#upload-label",

        popover: {
          title: "Tombol Upload",

          description:
            "Pengguna dapat mengunggah file excel yang berisi koordinat titik kontrol dan titik uji. Pastikan file sesuai dengan template yang disediakan.",

          side: "left",
          align: "center",
        },
      },

      {
        element: "#template-button",

        popover: {
          title: "Template File",

          description:
            "Tombol ini memungkinkan pengguna untuk mengunduh template file excel yang sesuai dengan struktur data yang dibutuhkan.",

          side: "left",
          align: "center",
        },
      },

      {
        element: "#map-preview",

        popover: {
          title: "Preview Peta",

          description:
            "Setelah mengunggah data, pengguna akan disajikan visualisasi titik sekutu dan titik uji transformasi datum.",

          side: "bottom",
          align: "center",
        },
      },

      {
        element: "#opsi-struktur",

        popover: {
          title: "Struktur Data",

          description:
            "Pengguna harus memilih struktur data yang sesuai dengan format file yang diunggah.",

          side: "right",
          align: "start",
        },
      },

      {
        element: "#opsi-metode",

        popover: {
          title: "Metode Perataan",

          description:
            "Pengguna harus memilih metode perataan yang diinginkan. Penjelasan mengenai metode perataan dapat ditemukan pada halaman awal.",

          side: "right",
          align: "start",
        },
      },

      {
        element: "#proses-button",

        popover: {
          title: "Tombol Proses",

          description:
            "Klik tombol proses untuk menjalankan perhitungan parameter transformasi datum.",

          side: "left",
          align: "center",
        },
      },
    ],
  });

  driverObj.drive();
};