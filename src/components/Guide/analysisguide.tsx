import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startAnalysisGuide = () => {
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
        element: "#tampilan-residu",

        popover: {
          title: "Visualisasi Hasil",

          description:
            "Pengguna dapat memilih tampilan hasil berupa peta persebaran residual atau grafik residual.",

          side: "left",
          align: "center",
        },
      },

      {
        element: "#content-wrapper",

        popover: {
          title: "Area Visualisasi",

          description:
            "Bagian ini menampilkan visualisasi residual hasil perhitungan dalam bentuk peta maupun grafik.",

          side: "bottom",
          align: "center",
        },
      },

      {
        element: "#jumlah-titik",

        popover: {
          title: "Jumlah Titik",

          description:
            "Menampilkan jumlah titik sekutu dan titik uji yang digunakan dalam proses perhitungan parameter.",

          side: "bottom",
          align: "start",
        },
      },

      {
        element: "#edit-status-button",

        popover: {
          title: "Edit Status Titik",

          description:
            "Pengguna dapat mengubah status titik sekutu maupun titik uji dan melakukan perhitungan ulang.",

          side: "left",
          align: "center",
        },
      },

      {
        element: "#uji-global",

        popover: {
          title: "Uji Global",

          description:
            "Menampilkan hasil pengujian global untuk mengetahui apakah model perhitungan memenuhi pengujian global secara statistik.",

          side: "left",
          align: "center",
        },
      },

      {
        element: "#data-snooping",

        popover: {
          title: "Data Snooping",

          description:
            "Digunakan untuk mendeteksi observasi yang mengandung kesalahan kasar pada data pengamatan. Pada bagian ini, pengguna dapat melihat hasil pengujian data snooping untuk setiap titik sekutu dan menghapus titik sekutu yang dianggap mengandung kesalahan kasar.",

          side: "left",
          align: "center",
        },
      },

      {
        element: "#rmse-titik-uji",

        popover: {
          title: "RMSE Titik Uji",

          description:
            "Menampilkan nilai RMSE titik uji sebagai indikator akurasi hasil transformasi datum.",

          side: "left",
          align: "center",
        },
      },

      {
        element: "#hasil-transformasi",

        popover: {
          title: "Parameter Transformasi",

          description:
            "Tabel ini menampilkan hasil parameter transformasi datum beserta simpangan baku dan signifikansinya.",

          side: "top",
          align: "center",
        },
      },

      {
        element: "#save-project-button",

        popover: {
          title: "Simpan Projek",

          description:
            "Pengguna dapat menyimpan hasil perhitungan parameter ke dalam akun. Anda harus masuk untuk menggunakan fitur ini.",

          side: "top",
          align: "start",
        },
      },

      {
        element: "#to-transform-button",

        popover: {
          title: "Transformasi Datum",

          description:
            "Melanjutkan proses ke halaman transformasi datum menggunakan parameter hasil perhitungan.",

          side: "top",
          align: "center",
        },
      },
    ],
  });

  driverObj.drive();
};