'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitWork(formData: FormData) {
    const classroomId = formData.get('classroomId') as string;
    const assignmentId = formData.get('assignmentId') as string;
    const files = formData.getAll('files') as File[]; // รับไฟล์ที่อัพโหลดมาทั้งหมด

    const supabase = await createClient()

    // 1. ตรวจสอบ User
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }
    }

    try {
        // 2. ดึง due_date เพื่อตัดสินใจ status
        const { data: assignment } = await supabase
            .from('assignments')
            .select('due_date')
            .eq('id', assignmentId)
            .single()

        const hasFiles = files && files.filter(f => f.size > 0).length > 0;
        const isPastDue = assignment?.due_date && new Date(assignment.due_date) < new Date();

        // กำหนด status ตามเงื่อนไข
        let status: string;
        if (!hasFiles) {
            // ไม่มีไฟล์ = นักเรียนกด "ทำเครื่องหมายว่าเสร็จสิ้น"
            status = 'assigned';
        } else if (isPastDue) {
            status = 'late';
        } else {
            status = 'submitted';
        }

        // 3. ตรวจสอบว่าเคยส่งงานหรือยัง
        const { data: existingSub } = await supabase
            .from('submissions')
            .select('id, status')
            .eq('assignment_id', assignmentId)
            .eq('student_id', user.id)
            .maybeSingle()

        let submissionId = existingSub?.id;

        if (existingSub) {
            // Update — อย่าเปลี่ยน status ถ้าเป็น 'graded' อยู่แล้ว
            const newStatus = existingSub.status === 'graded' ? 'graded' : status;
            const { error: updateErr } = await supabase
                .from('submissions')
                .update({
                    status: newStatus,
                    submitted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', submissionId);
            if (updateErr) throw updateErr;

            // ลบไฟล์เดิมออกก่อน แล้วเพิ่มใหม่
            await supabase
                .from('submission_attachments')
                .delete()
                .eq('submission_id', submissionId);
        } else {
            // Insert ใหม่
            const { data: newSub, error: insertErr } = await supabase
                .from('submissions')
                .insert({
                    assignment_id: assignmentId,
                    student_id: user.id,
                    status: status,
                    submitted_at: new Date().toISOString()
                })
                .select('id')
                .single()
            if (insertErr) throw insertErr;
            submissionId = newSub.id;
        }


        // 4. บันทึกข้อมูลไฟล์ (อัพโหลดไฟล์เข้า Storage ก่อน)
        if (files && files.length > 0) {
            const filesToInsert = [];

            for (const file of files) {
                // สร้างชื่อไฟล์แบบสุ่มให้ไม่ซ้ำกัน เพื่อป้องกันปัญหาไฟล์ชื่อซ้ำทับกัน
                const fileExt = file.name.split('.').pop() || '';
                const fileName = `${crypto.randomUUID()}.${fileExt}`;
                const filePath = `${assignmentId}/${user.id}/${fileName}`; // จัดโครงสร้างโฟลเดอร์: ไอดีงาน/ไอดีนร./ชื่อไฟล์

                // อัพโหลดไฟล์ขึ้น Supabase Storage (ใน Bucket ชื่อ 'work_files')
                const { data: uploadData, error: uploadErr } = await supabase
                    .storage
                    .from('work_files') // *** ต้องไปสร้าง Bucket ชื่อนี้ใน Supabase ด้วยนะ ***
                    .upload(filePath, file, { upsert: true });

                if (uploadErr) {
                    throw new Error(`อัพโหลดไฟล์ ${file.name} ล้มเหลว: ${uploadErr.message}`);
                }

                // เอาพับลิกลิงก์ (Public URL) คืนกลับมาเพื่อบันทึกลง SQL DB
                const { data: publicUrlData } = supabase
                    .storage
                    .from('work_files')
                    .getPublicUrl(filePath);

                filesToInsert.push({
                    submission_id: submissionId,
                    file_url: publicUrlData.publicUrl,
                    file_name: file.name,
                    file_size: file.size
                });
            }

            // บันทึก URL ไฟล์และข้อมูลของไฟล์ทั้งหมด ลงฐานข้อมูล SQL
            const { error: filesErr } = await supabase
                .from('submission_attachments')
                .insert(filesToInsert);
            if (filesErr) throw filesErr;
        }

        // 5. รีเฟรชหน้านี้
        revalidatePath(`/classroom/${classroomId}/assignment/${assignmentId}/assignment_details`)
        return { success: true }
    } catch (error: any) {
        console.error('Error submitting work:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการส่งงาน' }
    }
}

export async function unsubmitWork(classroomId: string, assignmentId: string) {
    const supabase = await createClient()

    // 1. ตรวจสอบ User
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }
    }

    try {
        const { data: existingSub } = await supabase
            .from('submissions')
            .select('id, status')
            .eq('assignment_id', assignmentId)
            .eq('student_id', user.id)
            .maybeSingle()

        if (!existingSub) {
            return { error: 'ไม่พบการส่งงาน' }
        }

        // ลบ submission → grades จะถูกลบอัตโนมัติผ่าน CASCADE
        const { error: deleteErr } = await supabase
            .from('submissions')
            .delete()
            .eq('id', existingSub.id);

        if (deleteErr) throw deleteErr;

        // พวก submission_attachments ลบไปด้วยเพราะ CASCADE บน DB 
        // แต่จริงๆ เราต้องลบไฟล์ออกจาก Supabase Storage ทิ้งเพื่อไม่ให้รกพื้นที่โควต้าด้วย
        // (ให้ดีที่สุดคือไปหาวิธีลบโฟลเดอร์จาก Storage โดย list แล้ว remove ออกครับ แต่ตอนนี้เอาแค่ DB ก็พอก่อน)

        // รีเฟรชหน้า
        revalidatePath(`/classroom/${classroomId}/assignment/${assignmentId}/assignment_details`)
        return { success: true }
    } catch (error: any) {
        console.error('Error un-submitting work:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการยกเลิก' }
    }
}
