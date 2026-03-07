import ClassroomID from "@/components/classroom/classroom-id";
import ClassroomStatus from "@/components/classroom/classroom-status";
import CreateForumButton from "@/components/classroom/forum/create-forum-button";
import { ForumPost } from "@/components/classroom/forum/post";
import NonForum from "@/components/classroom/forum/no-post";
import { createClient } from "@/utils/supabase/server";

// กำหนด type หรือใช้จากที่ประกาศไว้แล้วได้
export type Role = "creator" | "manager" | "member" | "student";

export default async function ForumPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: classroomId } = await params;
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Get user role in this class and class info
    let role = "member";
    let classCode = "";
    let isPrivate = false;
    if (user) {
        const { data: membership } = await supabase
            .from('classroom_members')
            .select('role')
            .eq('classroom_id', classroomId)
            .eq('user_id', user.id)
            .single();
        if (membership) {
            role = membership.role;
        }
    }

    // 2.1 Fetch class info
    const { data: classroom } = await supabase
        .from('classrooms')
        .select('join_code, is_private')
        .eq('id', classroomId)
        .single();

    if (classroom) {
        classCode = classroom.join_code;
        isPrivate = classroom.is_private;
    }

    // 3. Fetch forum posts (แยก attachments ออกมาต่างหากเพื่อป้องกัน permission error พัง post ทั้งหมด)
    const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
            id,
            title,
            description,
            created_at,
            author_id,
            profiles (first_name, last_name)
        `)
        .eq('classroom_id', classroomId)
        .order('created_at', { ascending: false });

    if (postsError) {
        console.error('[ForumPage] Error fetching posts:', JSON.stringify(postsError));
    }

    // 4. Fetch attachments แยกต่างหาก (ถ้า error จะยังแสดง posts ได้ปกติ)
    let attachmentsMap: Record<string, any[]> = {};
    if (posts && posts.length > 0) {
        const postIds = posts.map(p => p.id);
        const { data: attachments, error: attachErr } = await supabase
            .from('forum_attachments')
            .select('id, post_id, file_name, file_url, file_size, file_type')
            .in('post_id', postIds);

        if (attachErr) {
            console.error('[ForumPage] Error fetching attachments:', JSON.stringify(attachErr));
        } else if (attachments) {
            // จัดกลุ่ม attachments ตาม post_id
            for (const att of attachments) {
                if (!attachmentsMap[att.post_id]) attachmentsMap[att.post_id] = [];
                attachmentsMap[att.post_id].push(att);
            }
        }
    }


    return (
        <div className="justify-items-center">
            <div className="flex flex-col">
                <div className="flex w-[1200px] min-h-screen my-8">
                    <div className="w-1/4 flex flex-col">
                        {role !== "student" && role !== "member" && (
                            <div className="pb-2">
                                <CreateForumButton classroomId={classroomId} />
                            </div>
                        )}
                        {role !== "student" && role !== "member" && (
                            <div className="pb-2">
                                <ClassroomStatus classroomId={classroomId} initialPrivacy={isPrivate} />
                            </div>
                        )}
                        <div>
                            {classCode && <ClassroomID classCode={classCode} />}
                        </div>
                    </div>

                    <div className="w-3/4">
                        <div className="space-y-4">
                            {(posts && posts.length > 0) ? (
                                posts.map((post: any) => {
                                    const authorName = post.profiles
                                        ? `${post.profiles.first_name || ''} ${post.profiles.last_name || ''}`.trim()
                                        : 'ไม่ระบุชื่อ';

                                    return (
                                        <ForumPost
                                            key={post.id}
                                            id={post.id}
                                            classroomId={classroomId}
                                            initialTitle={post.title}
                                            initialContent={post.description}
                                            authorName={authorName}
                                            createdAt={post.created_at}
                                            role={role as any}
                                            initialFiles={attachmentsMap[post.id] || []}
                                        />
                                    )
                                })
                            ) : (
                                <NonForum />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}