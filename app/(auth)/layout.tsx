import { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <main className="relative flex min-h-screen w-full items-center justify-center bg-gray-50/50 p-4 dark:bg-zinc-950/50 overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            {/* Radial Gradient overlays */}
            <div className="absolute left-0 right-0 top-[-20%] -z-10 m-auto h-[400px] w-[500px] rounded-full bg-blue-400 opacity-20 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] -z-10 h-[400px] w-[400px] rounded-full bg-indigo-400 opacity-10 blur-[100px] pointer-events-none"></div>

            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors z-20 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
                <ArrowLeft className="h-4 w-4" />
                ย้อนกลับ
            </Link>

            <div className="relative z-10 w-full flex justify-center">
                {children}
            </div>
        </main>
    )
}
