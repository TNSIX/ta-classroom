'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ฟังก์ชันสำหรับสร้างรหัสชั้นเรียนแบบสุ่ม (8 หลัก: ตัวอักษรและตัวเลข)
function generateJoinCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export async function createClassroom(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }
    }

    // 1.5 Fallback - Ensure profile exists to prevent foreign key issues
    const firstName = user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || '';
    const lastName = user.user_metadata?.last_name || (user.user_metadata?.full_name?.split(' ').slice(1).join(' ')) || '';
    await supabase.from('profiles').upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
    }, { onConflict: 'id' });

    // 2. ดึงข้อมูลจากฟอร์ม
    const name = formData.get('name')?.toString() || ''
    const description = formData.get('description')?.toString() || ''
    const privacy = formData.get('privacy')?.toString() || 'public'
    const isPrivate = privacy === 'private'

    if (!name.trim()) {
        return { error: 'กรุณาระบุชื่อชั้นเรียน' }
    }

    try {
        // 3. หาสุ่มรหัส join_code ที่ไม่ซ้ำ
        let joinCode = generateJoinCode()
        let isUnique = false

        // ลองหาโค้ดที่ไม่ซ้ำอย่างมาก 5 รอบ
        for (let attempt = 0; attempt < 5; attempt++) {
            const { data: existingClass } = await supabase
                .from('classrooms')
                .select('id')
                .eq('join_code', joinCode)
                .single()

            if (!existingClass) {
                isUnique = true
                break
            }
            joinCode = generateJoinCode()
        }

        if (!isUnique) {
            return { error: 'ระบบไม่สามารถสร้างรหัสชั้นเรียนได้ กรุณาลองใหม่อีกครั้ง' }
        }

        // 4. บันทึกข้อมูลชั้นเรียนใหม่
        const { data: classroom, error: classroomError } = await supabase
            .from('classrooms')
            .insert([
                {
                    name: name,
                    description: description,
                    join_code: joinCode,
                    is_private: isPrivate,
                    created_by: user.id
                }
            ])
            .select()
            .single()

        if (classroomError) throw classroomError

        // 5. เพิ่มผู้สร้างให้อยู่ในตารางสมาชิก (Role: creator)
        const { error: memberError } = await supabase
            .from('classroom_members')
            .insert([
                {
                    classroom_id: classroom.id,
                    user_id: user.id,
                    role: 'creator'
                }
            ])

        if (memberError) throw memberError

        // พ่นค่ากลับเพื่อให้หน้ารีเฟรชและอัปเดตสถานะสำเร็จ
        revalidatePath('/classroom')
        return { success: true, classroomId: classroom.id }

    } catch (error: any) {
        console.error('Error creating classroom:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการสร้างชั้นเรียน' }
    }
}

export async function joinClassroom(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Check user login
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }
    }

    // 2. Get code
    const targetCode = formData.get('code')?.toString() || ''

    if (!targetCode.trim()) {
        return { error: 'กรุณาระบุรหัสชั้นเรียน' }
    }

    try {
        // 3. Find classroom by join_code (รวม is_private ด้วย)
        const { data: classroom, error: fetchError } = await supabase
            .from('classrooms')
            .select('id, is_private, name, created_by')
            .eq('join_code', targetCode)
            .single()

        if (fetchError || !classroom) {
            return { error: 'รหัสชั้นเรียนไม่ถูกต้อง หรือไม่พบชั้นเรียนนี้' }
        }

        // 4. Check if already a member
        const { data: existingMember } = await supabase
            .from('classroom_members')
            .select('classroom_id')
            .eq('classroom_id', classroom.id)
            .eq('user_id', user.id)
            .maybeSingle()

        if (existingMember) {
            return { error: 'คุณเป็นสมาชิกของชั้นเรียนนี้อยู่แล้ว' }
        }

        // 5. ถ้าชั้นเรียนเป็นส่วนตัว → สร้าง join_request แทนการเข้าร่วมทันที
        if (classroom.is_private) {
            // ตรวจว่ามีคำขอรออยู่แล้วหรือเปล่า
            const { data: existingRequest } = await supabase
                .from('join_requests')
                .select('id, status')
                .eq('classroom_id', classroom.id)
                .eq('user_id', user.id)
                .maybeSingle()

            if (existingRequest?.status === 'pending') {
                return { error: 'คุณได้ส่งคำขอเข้าร่วมชั้นเรียนนี้ไปแล้ว กรุณารอการอนุมัติ' }
            }

            // upsert คำขอ (ถ้าเคย rejected ก็ส่งใหม่ได้)
            const { error: requestError } = await supabase
                .from('join_requests')
                .upsert({
                    classroom_id: classroom.id,
                    user_id: user.id,
                    status: 'pending',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'classroom_id,user_id' })

            if (requestError) throw requestError

            return {
                success: true,
                pending: true,  // บอก client ว่าต้องรออนุมัติ
                classroomName: classroom.name
            }
        }

        // 6. ชั้นเรียนสาธารณะ → เข้าร่วมทันที
        const { error: joinError } = await supabase
            .from('classroom_members')
            .insert([{
                classroom_id: classroom.id,
                user_id: user.id,
                role: 'student'
            }])

        if (joinError) throw joinError

        revalidatePath('/classroom')
        return { success: true, pending: false, classroomId: classroom.id }

    } catch (error: any) {
        console.error('Error joining classroom:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการเข้าร่วมชั้นเรียน' }
    }
}

// ---- อนุมัติ/ปฏิเสธคำขอเข้าร่วมชั้นเรียน ----

export async function approveJoinRequest(requestId: string, classroomId: string) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { error: 'ไม่พบข้อมูลผู้ใช้' }

    try {
        // ตรวจสิทธิ์
        const { data: membership } = await supabase
            .from('classroom_members')
            .select('role')
            .eq('classroom_id', classroomId)
            .eq('user_id', user.id)
            .single()

        if (!membership || !['creator', 'manager'].includes(membership.role)) {
            return { error: 'คุณไม่มีสิทธิ์อนุมัติคำขอนี้' }
        }

        // ดึง request
        const { data: request } = await supabase
            .from('join_requests')
            .select('user_id')
            .eq('id', requestId)
            .single()

        if (!request) return { error: 'ไม่พบคำขอ' }

        // เพิ่มสมาชิก
        const { error: insertError } = await supabase
            .from('classroom_members')
            .insert([{ classroom_id: classroomId, user_id: request.user_id, role: 'student' }])

        if (insertError) {
            console.error('Insert Member Error:', insertError);
            return { error: 'ไม่สามารถเพิ่มนักเรียนได้ (' + insertError.message + ')' }
        }

        // อัปเดต status join_request เป็น approved
        const { error: updateError } = await supabase
            .from('join_requests')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', requestId)

        if (updateError) throw updateError

        revalidatePath('/classroom')
        return { success: true }
    } catch (error: any) {
        console.error('Approve Error:', error);
        return { error: error.message || 'เกิดข้อผิดพลาด' }
    }
}

export async function rejectJoinRequest(requestId: string, classroomId: string) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { error: 'ไม่พบข้อมูลผู้ใช้' }

    try {
        const { data: membership } = await supabase
            .from('classroom_members')
            .select('role')
            .eq('classroom_id', classroomId)
            .eq('user_id', user.id)
            .single()

        if (!membership || !['creator', 'manager'].includes(membership.role)) {
            return { error: 'คุณไม่มีสิทธิ์ปฏิเสธคำขอนี้' }
        }

        await supabase
            .from('join_requests')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('id', requestId)

        return { success: true }
    } catch (error: any) {
        return { error: error.message || 'เกิดข้อผิดพลาด' }
    }
}

export async function getPendingJoinRequests() {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return []

    try {
        const { data: requests, error } = await supabase
            .from('join_requests')
            .select(`
                id,
                created_at,
                classroom_id,
                classrooms ( name ),
                profiles!join_requests_user_id_fkey ( first_name, last_name )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) throw error

        return (requests || []).map((req: any) => ({
            id: req.id,
            type: 'join_request',
            classroomId: req.classroom_id,
            className: Array.isArray(req.classrooms) ? req.classrooms[0]?.name : req.classrooms?.name,
            user: {
                name: `${req.profiles?.first_name || ''} ${req.profiles?.last_name || ''}`.trim() || 'ผู้ใช้ไม่ระบุชื่อ',
                avatar: ''
            },
            isRead: false,
            createdAt: new Date(req.created_at).toLocaleString('th-TH')
        }))
    } catch (error) {
        console.error('Error fetching join requests:', error)
        return []
    }
}

export async function editClassroom(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Check user login
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }
    }

    const id = formData.get('id')?.toString() || ''
    const name = formData.get('name')?.toString() || ''
    const description = formData.get('description')?.toString() || ''

    if (!id || !name.trim()) {
        return { error: 'ข้อมูลไม่ครบถ้วน' }
    }

    try {
        const { error } = await supabase
            .from('classrooms')
            .update({ name, description })
            .eq('id', id)
            .eq('created_by', user.id) // Security check to ensure only creator can edit

        if (error) throw error

        revalidatePath('/classroom')
        return { success: true }
    } catch (error: any) {
        console.error('Error editing classroom:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการแก้ไขชั้นเรียน' }
    }
}

export async function deleteClassroom(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Check user login
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }
    }

    const id = formData.get('id')?.toString() || ''

    if (!id) {
        return { error: 'รหัสชั้นเรียนไม่ถูกต้อง' }
    }

    try {
        const { error } = await supabase
            .from('classrooms')
            .delete()
            .eq('id', id)
            .eq('created_by', user.id) // Only creator can delete

        if (error) throw error

        revalidatePath('/classroom')
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting classroom:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการลบชั้นเรียน' }
    }
}

export async function updateClassroomPrivacy(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Check user login
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }
    }

    const id = formData.get('id')?.toString() || ''
    const isPrivateString = formData.get('is_private')?.toString()
    const isPrivate = isPrivateString === 'true'

    if (!id) {
        return { error: 'รหัสชั้นเรียนไม่ถูกต้อง' }
    }

    try {
        // ตรวจสอบสิทธิ์ ผู้ที่มีสิทธิ์เปลี่ยนคือ creator หรือ manager
        const { data: membership } = await supabase
            .from('classroom_members')
            .select('role')
            .eq('classroom_id', id)
            .eq('user_id', user.id)
            .single()

        if (!membership || !['creator', 'manager'].includes(membership.role)) {
            return { error: 'คุณไม่มีสิทธิ์เปลี่ยนสถานะความเป็นส่วนตัวของชั้นเรียนนี้' }
        }

        const { error } = await supabase
            .from('classrooms')
            .update({ is_private: isPrivate })
            .eq('id', id)

        if (error) throw error

        revalidatePath(`/classroom/${id}/forum`)
        revalidatePath(`/classroom/${id}/assignment`)
        return { success: true }
    } catch (error: any) {
        console.error('Error updating classroom privacy:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรูปแบบชั้นเรียน' }
    }
}
