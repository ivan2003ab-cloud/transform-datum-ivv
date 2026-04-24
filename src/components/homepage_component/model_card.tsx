"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Calculator, Shuffle, List, ArrowRight } from "lucide-react"

export default function ModelCards() {
  const router = useRouter()
  const push = [
    {
      title: "Hitung Parameter",
      desc: "Menghitung parameter transformasi datum berdasarkan data koordinat sekutu.",
      icon: <Calculator size={22} />,
      color: "bg-blue-500 text-white",
      link: "/hitung_parameter/input",
    },
    {
      title: "Transformasi Datum",
      desc: "Melakukan transformasi koordinat antar datum menggunakan parameter yang tersedia.",
      icon: <Shuffle size={22} />,
      color: "bg-cyan-600 text-white",
      link: "/transformasi",
    },
    {
      title: "Parameter Saya",
      desc: "Menyimpan dan mengelola parameter transformasi yang telah dihitung.",
      icon: <List size={22} />,
      color: "bg-emerald-500 text-white",
      link: "/parameter_saya",
    },
  ]
  return (
    <div className="w-full mx-auto px-4 mt-10">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

        {/* ================= CARD 1 ================= */}
        <motion.div
          whileHover={{ y: -10, scale: 1.03 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card
            className="group border bg-gradient-to-br from-background to-muted/40 hover:shadow-2xl transition-all duration-300 h-full"
          >
            <CardHeader>

              <CardTitle className="flex items-center justify-center">
                Bursa Wolf
              </CardTitle>
              <div className="flex items-center justify-center">
                <Image src="/bursa.png" alt="Bursa Wolf" width={200} height={100} />
              </div>
              <CardDescription>
                <div className="text-justify text-black">
                Transformasi Bursa-Wolf menggunakan tujuh parameter, terdiri dari, tiga parameter rotasi (ω, φ, κ) untuk orientasi sumbu, tiga parameter translasi (ΔX, ΔY, ΔZ) untuk pergeseran origin, dan satu parameter skala (μ) untuk perubahan ukuran seragam. Model transformasi Bursa-Wolf merupakan penyederhanaan perhitungan dari model Helmert. Beberapa asumsi yang dilakukan untuk penyederhanaan adalah rotasi sumbu-sumbu koordinat dianggap sangat kecil, translasi sangat kecil, dan skala yang tidak berbeda signifikan (dianggap 1).
                Secara matematis, transformasi Bursa-Wolf dapat dinyatakan sebagai berikut:
                </div>
                <div className="flex items-center justify-center">
                  <Image src="/pers-bursa.png" alt="Persamaan Bursa Wolf" width={250} height={100} />
                </div>
              </CardDescription>

            </CardHeader>
          </Card>
        </motion.div>

        {/* ================= CARD 2 ================= */}
        <motion.div
          whileHover={{ y: -10, scale: 1.03 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card
            className="group border bg-gradient-to-br from-background to-muted/40 hover:shadow-2xl transition-all duration-300 h-full"
          >
            <CardHeader>


              <CardTitle className="flex items-center justify-center">
                Molodensky Badekas
              </CardTitle>
              <div className="flex items-center justify-center">
                <Image src="/molo.png" alt="Molodensky Badekas" width={200} height={100} />
              </div>
              <CardDescription>
                <div className="text-justify text-black">
                Model transformasi Molodensky-Badekas merupakan pengembangan dari model Bursa-Wolf yang memperkenalkan konsep sentroid sebagai referensi dalam perhitungan transformasi. Keunggulan model Molodensky-Badekas terletak pada kemampuannya mengatasi masalah korelasi tinggi antar parameter yang sering terjadi pada wilayah dengan cakupan terbatas, sehingga menjadi alternatif lebih stabil dibandingkan model Bursa-Wolf dalam skala lokal. Model Molodensky-Badekas ditunjukkan pada persamaan berikut:
                </div>
                <div className="flex items-center justify-center">
                  <Image src="/pers-molo.png" alt="PersamaanMolodensky Badekas" width={300} height={100} />
                </div>
              </CardDescription>

            </CardHeader>
          </Card>
        </motion.div>
    
      </div>
    <div className="w-full mt-10 px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

        {push.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card
              onClick={() => router.push(item.link)}
              className={`group cursor-pointer h-full flex flex-col border ${item.color} hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}
            >
              <CardHeader className="flex-1">

                {/* ICON */}
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white shadow-sm mb-3 mx-auto">
                  <div className={`
                    ${item.title === "Hitung Parameter" && "text-blue-500"}
                    ${item.title === "Transformasi Datum" && "text-cyan-500"}
                    ${item.title === "Parameter Saya" && "text-emerald-500"}
                      `}>
                    {item.icon}
                  </div>
                </div>

                {/* TITLE + ARROW */}
                <CardTitle className="flex items-center justify-center font-bold">
                  {item.title}
                  <ArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" size={18} />
                </CardTitle>

                {/* DESCRIPTION */}
                <CardDescription className="text-justify text-white leading-relaxed">
                  {item.desc}
                </CardDescription>

              </CardHeader>
            </Card>
          </motion.div>
        ))}

      </div>
    </div>
    </div>
  )
}