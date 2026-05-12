
"use client";

import { useRouter } from "next/navigation";
import {Folder } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function EmptyProjects() {
    const router = useRouter();
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-transparent border-2 border-blue-600">
          <Folder className="text-blue-600" />
        </EmptyMedia>
        <EmptyTitle>Anda tidak memiliki projek</EmptyTitle>
        <EmptyDescription>
          Anda tidak memiliki projek perhitungan parameter. Silakan membuat projek baru untuk menghitung parameter transformasi.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button className="
    bg-gradient-to-r 
    from-blue-600 
    to-blue-400 
    text-white
    transition-all
    duration-300
    ease-out
    hover:-translate-y-0.5
    hover:scale-105
    hover:shadow-xl
    hover:shadow-blue-400/40
    active:scale-95
  "
  onClick={() =>
    router.push("/hitung_parameter/input")
          }>Hitung Parameter</Button>
      </EmptyContent>
    </Empty>
  )
}
