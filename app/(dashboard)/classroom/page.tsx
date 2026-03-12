import { createClient } from '@/utils/supabase/server';
import ClassCard, { Role } from '@/components/classroom/(main)/classroom-card';

export default async function ClassroomPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // ดึงห้องเรียนทั้งหมดที่ user คนนี้เป็นสมาชิก
    // ข้อมูลจากตาราง classroom_members
    const { data: classMembers } = await supabase
        .from('classroom_members')
        .select(`
            role,
            classrooms (
                id,
                name,
                description,
                join_code,
                profiles:created_by (
                    first_name,
                    last_name,
                    avatar_url
                )
            )
        `)
        .eq('user_id', user?.id)
        .order('joined_at', { ascending: false });

    // แปลงโครงสร้างข้อมูลเพื่อให้ง่ายต่อการ map
    const classes = classMembers?.map(cm => {
        const classData = Array.isArray(cm.classrooms) ? cm.classrooms[0] : cm.classrooms;
        const profile = Array.isArray(classData?.profiles) ? classData?.profiles[0] : classData?.profiles;

        return {
            id: classData?.id,
            name: classData?.name || 'ไม่มีชื่อชั้นเรียน',
            description: classData?.description || '',
            creatorName: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'ไม่ระบุชื่อผู้สร้าง',
            creatorFirstName: profile?.first_name || '',
            creatorAvatarUrl: profile?.avatar_url || null,
            role: cm.role as Role
        };
    }) || [];

    return (
        <div className='w-full flex flex-col items-center mt-4 md:mt-8 px-4 md:px-8'>
            <div className='w-full max-w-[1600px]'>
                <div className='flex flex-col pb-4'>
                    <h1 className="text-xl text-gray-800">ชั้นเรียนทั้งหมด</h1>
                    <p className='text-gray-500'>ชั้นเรียนทั้งหมดที่คุณได้เข้าร่วม</p>
                </div>

                <div>
                    <div className='flex flex-row flex-wrap gap-6 justify-center sm:justify-start'>
                        {classes.length > 0 ? (
                            classes.map((cls) => (
                                <ClassCard
                                    key={cls.id}
                                    id={cls.id}
                                    name={cls.name}
                                    description={cls.description}
                                    creatorName={cls.creatorName}
                                    creatorFirstName={cls.creatorFirstName}
                                    creatorAvatarUrl={cls.creatorAvatarUrl}
                                    role={cls.role}
                                />
                            ))
                        ) : (
                            <div className='w-full p-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-300'>
                                <p className='text-gray-500 mb-2'>ยังไม่มีชั้นเรียนที่คุณเข้าร่วม หรือเป็นผู้สร้างเลยครับ</p>
                                <p className='text-sm text-gray-400'>ลองกดปุ่ม + ด้านบนขวาเพื่อ <b>สร้างชั้นเรียนใหม่</b> หรือ <b>เข้าร่วมชั้นเรียน</b> กันเลย</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}