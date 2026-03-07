"use client"

import { useState, useActionState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { login } from "@/app/(auth)/actions"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [state, formAction, isPending] = useActionState(login, null)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

    const togglePasswordVisibility = () => setShowPassword(!showPassword)

    const handleGoogleLogin = async () => {
        try {
            setIsGoogleLoading(true)
            const { createClient } = await import('@/utils/supabase/client')
            const supabase = createClient()
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            })
        } catch (error) {
            console.error('Error logging in with Google:', error)
            setIsGoogleLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md shadow-lg rounded-2xl border-gray-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-950">
            <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    เข้าสู่ระบบ
                </CardTitle>
                <CardDescription className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    เข้าสู่ระบบเพื่อใช้งาน
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading}
                        className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 transition-colors shadow-sm cursor-pointer"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <svg
                                className="mr-2 h-5 w-5"
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        )}
                        เข้าสู่ระบบด้วย Google Account
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full bg-gray-200 dark:bg-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-zinc-500 font-medium tracking-wider dark:bg-zinc-950 dark:text-zinc-400">
                            หรือ
                        </span>
                    </div>
                </div>

                <form action={formAction} className="space-y-4">
                    {state?.error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">
                            {state.error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-900 font-medium dark:text-zinc-100">อีเมล</Label>
                        <Input id="email" name="email" type="email" className="h-11 shadow-sm focus-visible:ring-blue-600 bg-gray-50/50 dark:bg-zinc-900/50" placeholder="กรอกอีเมล" required defaultValue={state?.email} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-zinc-900 font-medium dark:text-zinc-100">รหัสผ่าน</Label>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className="h-11 pr-10 shadow-sm focus-visible:ring-blue-600 bg-gray-50/50 dark:bg-zinc-900/50"
                                placeholder="กรอกรหัสผ่าน"
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none focus-visible:text-zinc-600 rounded-sm"
                                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                            >
                                {showPassword ? (
                                    <Eye className="h-5 w-5" />
                                ) : (
                                    <EyeOff className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={isPending} className="w-full h-11 text-base shadow-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                            {isPending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </Button>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="justify-center border-t border-gray-100 dark:border-zinc-800/80 pt-6 mt-2">
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    ยังไม่มีบัญชีผู้ใช้งาน?{" "}
                    <Link
                        href="/register"
                        className="text-blue-600 font-semibold hover:underline hover:text-blue-700 dark:text-zinc-200 dark:hover:text-white transition-colors"
                    >
                        สร้างบัญชีผู้ใช้งาน
                    </Link>
                </div>
            </CardFooter>
        </Card >
    )
}
