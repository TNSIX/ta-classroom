'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function changeMemberRole(classroomId: string, userId: string, newRole: 'manager' | 'student') {
    const supabase = await createClient()

    // 1. Check current operator
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้' }
    }

    // 2. Check operator role (must be creator)
    const { data: opMembership } = await supabase
        .from('classroom_members')
        .select('role')
        .eq('classroom_id', classroomId)
        .eq('user_id', user.id)
        .single()

    if (!opMembership || opMembership.role !== 'creator') {
        return { error: 'คุณไม่มีสิทธิ์เปลี่ยนบทบาท' }
    }

    // 3. Prevent modifying the creator's role
    const { data: targetMembership } = await supabase
        .from('classroom_members')
        .select('role')
        .eq('classroom_id', classroomId)
        .eq('user_id', userId)
        .single()

    if (!targetMembership || targetMembership.role === 'creator') {
        return { error: 'ไม่สามารถเปลี่ยนบทบาทของผู้สร้างชั้นเรียนได้' }
    }

    // 4. Update role
    const { error } = await supabase
        .from('classroom_members')
        .update({ role: newRole })
        .eq('classroom_id', classroomId)
        .eq('user_id', userId)

    if (error) {
        console.error("Change Role Error:", error)
        return { error: 'เกิดข้อผิดพลาดในการเปลี่ยนบทบาท: ' + error.message }
    }

    revalidatePath(`/classroom/${classroomId}/people`)
    return { success: true }
}

export async function removeMember(classroomId: string, userId: string) {
    const supabase = await createClient()

    // 1. Check current operator
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้' }
    }

    // 2. Check operator role
    const { data: opMembership } = await supabase
        .from('classroom_members')
        .select('role')
        .eq('classroom_id', classroomId)
        .eq('user_id', user.id)
        .single()

    if (!opMembership || (opMembership.role !== 'creator' && opMembership.role !== 'manager')) {
        return { error: 'คุณไม่มีสิทธิ์นำสมาชิกออกจากชั้นเรียน' }
    }

    // 3. Prevent modifying the creator, or manager removing manager
    const { data: targetMembership } = await supabase
        .from('classroom_members')
        .select('role')
        .eq('classroom_id', classroomId)
        .eq('user_id', userId)
        .single()

    if (!targetMembership) return { error: 'ไม่พบสมาชิก' }

    if (targetMembership.role === 'creator') {
        return { error: 'ไม่สามารถนำผู้สร้างชั้นเรียนออกได้' }
    }

    if (opMembership.role !== 'creator' && targetMembership.role === 'manager') {
        return { error: 'คุณไม่มีสิทธิ์นำผู้จัดการออกจากชั้นเรียน' }
    }

    // 4. Remove member
    const { error } = await supabase
        .from('classroom_members')
        .delete()
        .eq('classroom_id', classroomId)
        .eq('user_id', userId)

    if (error) {
        console.error("Remove Member Error:", error)
        return { error: 'เกิดข้อผิดพลาดในการนำสมาชิกออก: ' + error.message }
    }

    revalidatePath(`/classroom/${classroomId}/people`)
    return { success: true }
}
