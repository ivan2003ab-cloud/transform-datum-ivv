"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  children: React.ReactNode;
};

export default function TemplateTransform({
  children,
}: Props) {

  const animatedButton =
    "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg active:scale-95";

  const downloadTemplate = (
    type:string
  )=>{

    let filePath="";

    if(type==="cartesian"){
      filePath=
      "/template-hitungparams-kartesi.xlsx";
    } else {
      filePath=
      "/template-hitungparams-geodetik.xlsx";
    }

    const link =
      document.createElement("a");

    link.href=filePath;

    link.download=
      filePath.split("/").pop() ||
      "template.xlsx";

    link.click();
  };

  return(
    <Dialog>

      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[380px] rounded-3xl">

        <DialogHeader>
          <DialogTitle className="text-xl text-blue-900">
            Pilih Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">

          <button
            onClick={() =>
              downloadTemplate(
                "cartesian"
              )
            }
            className={`
            w-full px-4 py-3
            rounded-xl
            bg-gradient-to-r
            from-blue-700
            to-blue-500
            text-white
            ${animatedButton}
            `}
          >
            Cartesian (XYZ)
          </button>

          <button
            onClick={() =>
              downloadTemplate(
                "dd"
              )
            }
            className={`
            w-full px-4 py-3
            rounded-xl
            bg-gradient-to-r
            from-emerald-700
            to-emerald-500
            text-white
            ${animatedButton}
            `}
          >
            Geodetik (Degree)
          </button>

        </div>

      </DialogContent>

    </Dialog>
  );
}