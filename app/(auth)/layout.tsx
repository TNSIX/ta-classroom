import { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-gray-50/50 p-4 dark:bg-zinc-950/50">
            {children}
        </main>
    )
}
