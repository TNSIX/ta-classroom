'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveGrades(classroomId: string, assignmentId: string, gradesData: { studentId: string, score: number | null }[]) {
    const supabase = await createClient()

    // 1. ตรวจสอบ User
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่' }
    }

    try {
        // 2. ตรวจสอบสิทธิ์ว่ามีสิทธิ์ตรวจงานไหม (ต้องเป็น creator หรือ manager)
        const { data: membership } = await supabase
            .from('classroom_members')
            .select('role')
            .eq('classroom_id', classroomId)
            .eq('user_id', user.id)
            .single()

        if (!membership || !['creator', 'manager'].includes(membership.role)) {
            return { error: 'คุณไม่มีสิทธิ์ตรวจงานในชั้นเรียนนี้' }
        }

        // 3. วนลูปบันทึกคะแนน
        for (const data of gradesData) {
            // ถ้าครูให้คะแนน แต่เด็กยังไม่เคยมี submission ในระบบ ให้สร้าง submission จำลองขึ้นมาก่อน
            // หรือถ้ามีอยู่แล้วก็ให้อัปเดท status เป็น graded ถ้าคะแนนไม่เป็น null

            // หา submission ของเด็กคนนี้
            let { data: subData } = await supabase
                .from('submissions')
                .select('id')
                .eq('assignment_id', assignmentId)
                .eq('student_id', data.studentId)
                .maybeSingle();

            let submissionId = subData?.id;

            // ถ้าไม่มี submission ให้สร้างใหม่ (กรณีครูให้คะแนนคนยังไม่ส่ง)
            if (!submissionId && data.score !== null) {
                const { data: newSub, error: insertSubErr } = await supabase
                    .from('submissions')
                    .insert({
                        assignment_id: assignmentId,
                        student_id: data.studentId,
                        status: 'graded'  // ครูให้คะแนนโดยตรง → graded ทันที
                    })
                    .select('id')
                    .single()

                if (insertSubErr) throw insertSubErr;
                submissionId = newSub.id;
            } else if (submissionId && data.score !== null) {

                // อัปเดตสถานะเป็น graded ถ้าให้คะแนน
                await supabase
                    .from('submissions')
                    .update({ status: 'graded', updated_at: new Date().toISOString() })
                    .eq('id', submissionId);
            }

            // จัดการ Table grades
            if (data.score === null) {
                // ถ้าลบคะแนนทิ้ง ก็ลบ grade ออก
                await supabase
                    .from('grades')
                    .delete()
                    .eq('submission_id', submissionId);
            } else {
                // ตรวจสอบว่ามี grade เดิมไหม
                const { data: existingGrade } = await supabase
                    .from('grades')
                    .select('id')
                    .eq('submission_id', submissionId)
                    .maybeSingle();

                if (existingGrade) {
                    // Update
                    await supabase
                        .from('grades')
                        .update({ score: data.score, grader_id: user.id, graded_at: new Date().toISOString() })
                        .eq('submission_id', submissionId);
                } else {
                    // Insert
                    await supabase
                        .from('grades')
                        .insert({
                            submission_id: submissionId,
                            score: data.score,
                            grader_id: user.id
                        });
                }
            }
        }

        // 4. รีเฟรชหน้าบอร์ดของห้องนั้น
        revalidatePath(`/classroom/${classroomId}/assignment/${assignmentId}/assignment_works`)
        return { success: true }
    } catch (error: any) {
        console.error('Error saving grades:', error)
        return { error: error.message || 'เกิดข้อผิดพลาดในการบันทึกคะแนน' }
    }
}
