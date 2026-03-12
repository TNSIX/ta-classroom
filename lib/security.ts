'use server'

import { createClient } from '@/utils/supabase/server'
import { Role } from '@/components/classroom/(main)/classroom-card'

/**
 * ดึงข้อมูล User ที่ล็อกอินอยู่ และตรวจสอบว่ามี Session จริง
 */
export async function getAuthenticatedUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่')
    }

    return { user, supabase }
}

/**
 * ตรวจสอบสิทธิ์ของ User ในห้องเรียนที่ระบุ
 * @param classroomId รหัสห้องเรียน
 * @param allowedRoles รายการ Role ที่อนุญาต (ถ้าไม่ใส่ จะอนุญาตเฉพาะ creator และ manager)
 */
export async function validateClassroomAccess(classroomId: string, allowedRoles: Role[] = ['creator', 'manager']) {
    const { user, supabase } = await getAuthenticatedUser()

    const { data: membership, error } = await supabase
        .from('classroom_members')
        .select('role')
        .eq('classroom_id', classroomId)
        .eq('user_id', user.id)
        .maybeSingle()

    if (error || !membership || !allowedRoles.includes(membership.role as Role)) {
        throw new Error('คุณไม่มีสิทธิ์ดำเนินการในห้องเรียนนี้')
    }

    return { user, supabase, role: membership.role as Role }
}

/**
 * ตรวจสอบว่า Assignment อยู่ใน Classroom ที่ระบุจริงหรือไม่
 * เพื่อป้องกันการส่ง ID มั่วข้ามห้อง (IDOR Attack)
 */
export async function validateAssignmentContext(assignmentId: string, classroomId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('assignments')
        .select('id, classroom_id')
        .eq('id', assignmentId)
        .eq('classroom_id', classroomId)
        .maybeSingle()

    if (error || !data) {
        throw new Error('ข้อมูลงานไม่สัมพันธ์กับห้องเรียนที่ระบุ')
    }

    return true
}
