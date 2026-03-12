'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAssignment(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. ตรวจสอบ User
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }
    }

    // 2. รับข้อมูล
    const classroomId = formData.get('classroomId')?.toString() || ''
    const title = formData.get('title')?.toString() || ''
    const description = formData.get('description')?.toString() || ''
    const dueDateStr = formData.get('dueDate')?.toString() || ''
    const dueTimeStr = formData.get('dueTime')?.toString() || ''
    const pointsStr = formData.get('points')?.toString() ?? ''
    const files = formData.getAll('files') as File[]
    console.log('[Assignment] Creating:', { classroomId, title, fileCount: files.length })

    if (!classroomId || !title.trim()) {
        return { error: 'ข้อมูลไม่ครบถ้วน' }
    }

    // คำนวณวันที่ส่งถ้ามี
    let dueDateISO = null;
    if (dueDateStr) {
        const timeStr = dueTimeStr || '23:59';
        dueDateISO = new Date(`${dueDateStr}T${timeStr}:00`).toISOString();
    }

    try {
        // 3. ตรวจสอบสิทธิ์ว่ามีสิทธิ์โพสต์ไหม (ต้องเป็น creator หรือ manager)
        const { data: membership } = await supabase
            .from('classroom_members')
            .select('role')
            .eq('classroom_id', classroomId)
            .eq('user_id', user.id)
            .single()

        if (!membership || !['creator', 'manager'].includes(membership.role)) {
            return { error: 'คุณไม่มีสิทธิ์สร้างงานในชั้นเรียนนี้' }
        }

        // 4. บันทึกข้อมูลงานใหม่ลงฐานข้อมูล
        const { data: newAssignment, error: insertError } = await supabase
            .from('assignments')
            .insert({
                classroom_id: classroomId,
                title,
                description,
                due_date: dueDateISO,
                points: pointsStr !== '' ? parseInt(pointsStr, 10) : null,
                created_by: user.id
            })
            .select('id')
            .single()

        if (insertError) throw insertError

        // 5. จัดการไฟล์แนบ (ถ้ามี)
        const validFiles = files.filter(f => f.size > 0)
        console.log('[Assignment] Valid files:', validFiles.length)
        if (validFiles.length > 0) {
            const filesToInsert: { assignment_id: string; file_url: string; file_name: string; file_size: number; file_type: string }[] = []

            for (const file of validFiles) {
                const fileExt = file.name.split('.').pop() || ''
                const fileName = `${crypto.randomUUID()}.${fileExt}`
                const filePath = `${classroomId}/${newAssignment.id}/${fileName}`

                const arrayBuffer = await file.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                console.log('[Assignment] Uploading:', file.name, '→', filePath)
                const { error: uploadErr } = await supabase
                    .storage
                    .from('assignment_attachments')
                    .upload(filePath, buffer, {
                        contentType: file.type || 'application/octet-stream',
                        upsert: false
                    })

                if (uploadErr) {
                    console.error('[Assignment] Upload error for', file.name, ':', JSON.stringify(uploadErr))
                    continue
                }
                console.log('[Assignment] Upload success:', file.name)

                const { data: publicUrlData } = supabase
                    .storage
                    .from('assignment_attachments')
                    .getPublicUrl(filePath)

                filesToInsert.push({
                    assignment_id: newAssignment.id,
                    file_url: publicUrlData.publicUrl,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type || fileExt
                })
            }

            if (filesToInsert.length > 0) {
                const { error: attachError } = await supabase
                    .from('assignment_attachments')
                    .insert(filesToInsert)
                if (attachError) {
                    console.error('[Assignment] DB attach error:', JSON.stringify(attachError))
                } else {
                    console.log('[Assignment] Attachments saved:', filesToInsert.length)
                }
            }
        }

        // 6. รีเฟรชหน้าบอร์ดของห้องนั้น
        revalidatePath(`/classroom/${classroomId}/assignment`)
        return { success: true }
    } catch (error: any) {
        console.error('Error creating assignment:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการสร้างงาน' }
    }
}

export async function editAssignment(
    assignmentId: string,
    classroomId: string,
    title: string,
    description: string,
    dueDateStr: string,
    dueTimeStr: string,
    pointsStr: string,
    filesToDelete: string[] = [],   // IDs ของ assignment_attachments ที่ต้องลบ
    newFiles: File[] = []           // ไฟล์ใหม่ที่ต้องอัปโหลด
) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }
    }

    let dueDateISO = null;
    if (dueDateStr) {
        const timeStr = dueTimeStr || '23:59';
        dueDateISO = new Date(`${dueDateStr}T${timeStr}:00`).toISOString();
    }

    try {
        const { data: membership } = await supabase
            .from('classroom_members')
            .select('role')
            .eq('classroom_id', classroomId)
            .eq('user_id', user.id)
            .single()

        if (!membership || !['creator', 'manager'].includes(membership.role)) {
            const { data: assignment } = await supabase
                .from('assignments')
                .select('created_by')
                .eq('id', assignmentId)
                .single()

            if (!assignment || assignment.created_by !== user.id) {
                return { error: 'คุณไม่มีสิทธิ์แก้ไขงานนี้' }
            }
        }

        // 1. Update assignment fields
        const { error: updateError } = await supabase
            .from('assignments')
            .update({
                title,
                description,
                due_date: dueDateISO,
                points: pointsStr !== '' ? parseInt(pointsStr, 10) : null,
            })
            .eq('id', assignmentId)

        if (updateError) throw updateError

        // 2. ลบไฟล์เก่าที่ถูกลบออก
        if (filesToDelete.length > 0) {
            // ดึง file_url ก่อนเพื่อ delete จาก storage ด้วย
            const { data: toDelete } = await supabase
                .from('assignment_attachments')
                .select('id, file_url')
                .in('id', filesToDelete)

            if (toDelete && toDelete.length > 0) {
                // Extract storage path จาก public URL
                const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assignment_attachments/`
                const storagePaths = toDelete
                    .map(f => f.file_url.replace(storageBase, ''))
                    .filter(Boolean)

                if (storagePaths.length > 0) {
                    await supabase.storage.from('assignment_attachments').remove(storagePaths)
                }

                const { error: deleteAttachError } = await supabase
                    .from('assignment_attachments')
                    .delete()
                    .in('id', filesToDelete)

                if (deleteAttachError) {
                    console.error('[EditAssignment] Delete attachment error:', JSON.stringify(deleteAttachError))
                }
            }
        }

        // 3. อัปโหลดไฟล์ใหม่
        const validNewFiles = newFiles.filter(f => f.size > 0)
        if (validNewFiles.length > 0) {
            const filesToInsert: { assignment_id: string; file_url: string; file_name: string; file_size: number; file_type: string }[] = []

            for (const file of validNewFiles) {
                const fileExt = file.name.split('.').pop() || ''
                const fileName = `${crypto.randomUUID()}.${fileExt}`
                const filePath = `${classroomId}/${assignmentId}/${fileName}`

                const arrayBuffer = await file.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                const { error: uploadErr } = await supabase
                    .storage
                    .from('assignment_attachments')
                    .upload(filePath, buffer, {
                        contentType: file.type || 'application/octet-stream',
                        upsert: false
                    })

                if (uploadErr) {
                    console.error('[EditAssignment] Upload error:', file.name, JSON.stringify(uploadErr))
                    continue
                }

                const { data: publicUrlData } = supabase
                    .storage
                    .from('assignment_attachments')
                    .getPublicUrl(filePath)

                filesToInsert.push({
                    assignment_id: assignmentId,
                    file_url: publicUrlData.publicUrl,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type || fileExt
                })
            }

            if (filesToInsert.length > 0) {
                const { error: attachError } = await supabase
                    .from('assignment_attachments')
                    .insert(filesToInsert)
                if (attachError) {
                    console.error('[EditAssignment] DB attach error:', JSON.stringify(attachError))
                }
            }
        }

        revalidatePath(`/classroom/${classroomId}/assignment`)
        revalidatePath(`/classroom/${classroomId}/assignment/${assignmentId}/assignment_details`)
        return { success: true }
    } catch (error: any) {
        console.error('Error updating assignment:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการแก้ไขงาน' }
    }
}

export async function deleteAssignment(assignmentId: string, classroomId: string) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }
    }

    try {
        const { data: membership } = await supabase
            .from('classroom_members')
            .select('role')
            .eq('classroom_id', classroomId)
            .eq('user_id', user.id)
            .single()

        if (!membership || !['creator', 'manager'].includes(membership.role)) {
            // Check if user is the author
            const { data: assignment } = await supabase
                .from('assignments')
                .select('created_by')
                .eq('id', assignmentId)
                .single()

            if (!assignment || assignment.created_by !== user.id) {
                return { error: 'คุณไม่มีสิทธิ์ลบงานนี้' }
            }
        }

        const { error: deleteError } = await supabase
            .from('assignments')
            .delete()
            .eq('id', assignmentId)

        if (deleteError) throw deleteError

        revalidatePath(`/classroom/${classroomId}/assignment`)
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting assignment:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการลบงาน' }
    }
}
