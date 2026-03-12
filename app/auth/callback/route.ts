import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Ensure profile exists to prevent foreign key constraint violations
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const firstName = user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || '';
                const lastName = user.user_metadata?.last_name || (user.user_metadata?.full_name?.split(' ').slice(1).join(' ')) || '';
                const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

                await supabase.from('profiles').upsert({
                    id: user.id,
                    first_name: firstName,
                    last_name: lastName,
                    avatar_url: avatarUrl,
                }, { onConflict: 'id' });
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=Could not authenticate with provider`)
}
