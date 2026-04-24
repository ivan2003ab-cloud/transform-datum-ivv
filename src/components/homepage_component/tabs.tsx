import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"


export function homepageTabs() {
  return (
    <Tabs defaultValue="bursa" className="w-full">
      <TabsList className="flex w-fit mx-auto">
        <TabsTrigger value="bursa">Bursa Wolf</TabsTrigger>
        <TabsTrigger value="molodensky">Molodensky Badekas</TabsTrigger>

      </TabsList>
      <TabsContent value="bursa">
        <Card>
          <CardHeader>
            <CardTitle>Bursa Wolf</CardTitle>
            <Image src="/bursa.png" alt="Bursa Wolf" width={200} height={100} />
            <CardDescription>
              Transformasi Bursa-Wolf menggunakan tujuh parameter, terdiri dari, tiga parameter rotasi (ω, φ, κ) untuk orientasi sumbu, tiga parameter translasi (ΔX, ΔY, ΔZ) untuk pergeseran origin, dan satu parameter skala (μ) untuk perubahan ukuran seragam. Model transformasi Bursa-Wolf merupakan penyederhanaan perhitungan dari model Helmert. Beberapa asumsi yang dilakukan untuk penyederhanaan adalah rotasi sumbu-sumbu koordinat dianggap sangat kecil, translasi sangat kecil, dan skala yang tidak berbeda signifikan (dianggap 1).
              Secara matematis, transformasi Bursa-Wolf dapat dinyatakan sebagai berikut:
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
      <TabsContent value="molodensky">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <Image src="/molo.png" alt="Molodensky Badekas" width={200} height={100} />
            <CardDescription>
              Track performance and user engagement metrics. Monitor trends and
              identify growth opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Page views are up 25% compared to last month.
          </CardContent>
        </Card>
      </TabsContent>
      
    </Tabs>
  )
}
