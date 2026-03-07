'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createForumPost(prevState: any, formData: FormData) {
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
    const files = formData.getAll('files') as File[]

    console.log('[Forum] Creating post:', { classroomId, title, fileCount: files.length })

    if (!classroomId || !title.trim()) {
        return { error: 'ข้อมูลไม่ครบถ้วน' }
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
            return { error: 'คุณไม่มีสิทธิ์สร้างประกาศในชั้นเรียนนี้' }
        }

        // 4. บันทึกประกาศลงฐานข้อมูล และรับ id ที่พึ่งสร้าง
        const { data: newPost, error: insertError } = await supabase
            .from('forum_posts')
            .insert({
                classroom_id: classroomId,
                title,
                description,
                author_id: user.id
            })
            .select('id')
            .single()

        if (insertError) {
            console.error('[Forum] Insert post error:', insertError)
            throw insertError
        }

        console.log('[Forum] Post created with id:', newPost.id)

        // 5. จัดการไฟล์แนบ (ถ้ามี)
        const validFiles = files.filter(f => f.size > 0)
        console.log('[Forum] Valid files to upload:', validFiles.length)

        if (validFiles.length > 0) {
            const filesToInsert: { post_id: string; file_url: string; file_name: string; file_size: number; file_type: string }[] = []

            for (const file of validFiles) {
                const fileExt = file.name.split('.').pop() || ''
                const fileName = `${crypto.randomUUID()}.${fileExt}`
                const filePath = `${classroomId}/${newPost.id}/${fileName}`

                console.log('[Forum] Uploading file:', file.name, '→', filePath)

                // แปลง File เป็น Buffer เพื่อให้อัปโหลดใน Server Action ผ่าน Supabase ได้ชัวร์ขึ้น
                const arrayBuffer = await file.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                // อัปโหลดไปยัง Supabase Storage Bucket ชื่อ 'forum_attachments'
                const { error: uploadErr } = await supabase
                    .storage
                    .from('forum_attachments')
                    .upload(filePath, buffer, {
                        contentType: file.type || 'application/octet-stream',
                        upsert: false
                    })

                if (uploadErr) {
                    // log error แต่ไม่ยกเลิกทั้งหมด — โพสต์ยังถูกสร้าง
                    console.error('[Forum] Upload error for', file.name, ':', JSON.stringify(uploadErr))
                    continue
                }

                const { data: publicUrlData } = supabase
                    .storage
                    .from('forum_attachments')
                    .getPublicUrl(filePath)

                console.log('[Forum] File uploaded. URL:', publicUrlData.publicUrl)

                filesToInsert.push({
                    post_id: newPost.id,
                    file_url: publicUrlData.publicUrl,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type || fileExt
                })
            }

            if (filesToInsert.length > 0) {
                const { error: attachError } = await supabase
                    .from('forum_attachments')
                    .insert(filesToInsert)
                if (attachError) {
                    console.error('[Forum] DB attach error:', JSON.stringify(attachError))
                } else {
                    console.log('[Forum] Attachments saved:', filesToInsert.length)
                }
            }
        }

        // 6. รีเฟรชหน้าบอร์ดของห้องนั้น
        revalidatePath(`/classroom/${classroomId}/forum`)
        return { success: true }
    } catch (error: any) {
        console.error('[Forum] Error creating forum post:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการสร้างประกาศ' }
    }
}


export async function editForumPost(
    postId: string,
    classroomId: string,
    title: string,
    description: string,
    filesToDelete: string[] = [],   // IDs ของ forum_attachments ที่ต้องลบ
    newFiles: File[] = []           // ไฟล์ใหม่ที่ต้องอัปโหลด
) {
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
            const { data: post } = await supabase
                .from('forum_posts')
                .select('author_id')
                .eq('id', postId)
                .single()

            if (!post || post.author_id !== user.id) {
                return { error: 'คุณไม่มีสิทธิ์แก้ไขประกาศนี้' }
            }
        }

        // 1. Update post fields
        const { error: updateError } = await supabase
            .from('forum_posts')
            .update({ title, description })
            .eq('id', postId)

        if (updateError) throw updateError

        // 2. ลบไฟล์เก่าที่ถูกลบออก
        if (filesToDelete.length > 0) {
            const { data: toDelete } = await supabase
                .from('forum_attachments')
                .select('id, file_url')
                .in('id', filesToDelete)

            if (toDelete && toDelete.length > 0) {
                const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/forum_attachments/`
                const storagePaths = toDelete
                    .map(f => f.file_url.replace(storageBase, ''))
                    .filter(Boolean)

                if (storagePaths.length > 0) {
                    await supabase.storage.from('forum_attachments').remove(storagePaths)
                }

                await supabase
                    .from('forum_attachments')
                    .delete()
                    .in('id', filesToDelete)
            }
        }

        // 3. อัปโหลดไฟล์ใหม่
        const validNewFiles = newFiles.filter(f => f.size > 0)
        if (validNewFiles.length > 0) {
            const filesToInsert: { post_id: string; file_url: string; file_name: string; file_size: number; file_type: string }[] = []

            for (const file of validNewFiles) {
                const fileExt = file.name.split('.').pop() || ''
                const fileName = `${crypto.randomUUID()}.${fileExt}`
                const filePath = `${classroomId}/${postId}/${fileName}`

                const arrayBuffer = await file.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                const { error: uploadErr } = await supabase
                    .storage
                    .from('forum_attachments')
                    .upload(filePath, buffer, {
                        contentType: file.type || 'application/octet-stream',
                        upsert: false
                    })

                if (uploadErr) {
                    console.error('[EditForum] Upload error:', file.name, JSON.stringify(uploadErr))
                    continue
                }

                const { data: publicUrlData } = supabase
                    .storage
                    .from('forum_attachments')
                    .getPublicUrl(filePath)

                filesToInsert.push({
                    post_id: postId,
                    file_url: publicUrlData.publicUrl,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type || fileExt
                })
            }

            if (filesToInsert.length > 0) {
                const { error: attachError } = await supabase
                    .from('forum_attachments')
                    .insert(filesToInsert)
                if (attachError) {
                    console.error('[EditForum] DB attach error:', JSON.stringify(attachError))
                }
            }
        }

        revalidatePath(`/classroom/${classroomId}/forum`)
        return { success: true }
    } catch (error: any) {
        console.error('Error updating forum post:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการแก้ไขประกาศ' }
    }
}



export async function deleteForumPost(postId: string, classroomId: string) {
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
            const { data: post } = await supabase
                .from('forum_posts')
                .select('author_id')
                .eq('id', postId)
                .single()

            if (!post || post.author_id !== user.id) {
                return { error: 'คุณไม่มีสิทธิ์ลบประกาศนี้' }
            }
        }

        const { error: deleteError } = await supabase
            .from('forum_posts')
            .delete()
            .eq('id', postId)

        if (deleteError) throw deleteError

        revalidatePath(`/classroom/${classroomId}/forum`)
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting forum post:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการลบประกาศ' }
    }
}

