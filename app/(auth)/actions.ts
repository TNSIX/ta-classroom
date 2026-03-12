'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message, email: data.email }
    }

    revalidatePath('/', 'layout')
    redirect('/chat')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        firstname: (formData.get('firstName') as string)?.trim(),
        lastname: (formData.get('lastName') as string)?.trim(),
    }

    const confirmPassword = formData.get('confirmPassword') as string

    // Validate required fields
    if (!data.firstname) {
        return { error: 'กรุณากรอกชื่อ', firstName: data.firstname, lastName: data.lastname, email: data.email }
    }
    if (!data.lastname) {
        return { error: 'กรุณากรอกนามสกุล', firstName: data.firstname, lastName: data.lastname, email: data.email }
    }
    if (!data.email) {
        return { error: 'กรุณากรอกอีเมล', firstName: data.firstname, lastName: data.lastname, email: data.email }
    }
    if (!data.password) {
        return { error: 'กรุณากรอกรหัสผ่าน', firstName: data.firstname, lastName: data.lastname, email: data.email }
    }
    if (data.password !== confirmPassword) {
        return { error: 'รหัสผ่านไม่ตรงกัน', firstName: data.firstname, lastName: data.lastname, email: data.email }
    }

    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                first_name: data.firstname,
                last_name: data.lastname,
            }
        }
    })

    if (error) {
        return { error: error.message, firstName: data.firstname, lastName: data.lastname, email: data.email }
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check your email to continue sign in process')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
