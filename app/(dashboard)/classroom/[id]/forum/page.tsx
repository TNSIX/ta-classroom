"use client"

import ClassroomID from "@/components/classroom/classroom-id";
import ClassroomStatus from "@/components/classroom/classroom-status";
import CreateForumButton from "@/components/classroom/forum/create-forum-button";
import { ForumPost } from "@/components/classroom/forum/post";
import NonForum from "@/components/classroom/forum/no-post";
import { useState } from "react";

// กำหนด type หรือใช้จากที่ประกาศไว้แล้วได้
export type Role = "creator" | "manager" | "member";

export default function ForumPage(role = "creator") {
    // กำหนดตัวแปร role (จำลองว่าดึงสถานะมาจาก Context, Auth หรือ API)


    const [posts, setPosts] = useState<any[]>([
        { id: 1 },
        { id: 2 }
    ]);

    const handleCreatePost = (newPost: any) => {
        setPosts([newPost, ...posts]);
    };

    const handleDeletePost = (id: number | string) => {
        setPosts(posts.filter(post => post.id !== id));
    };

    return (
        <div className="justify-items-center">
            <div className="flex flex-col">
                <div className="flex w-[1200px] min-h-screen my-8">
                    <div className="w-1/4 flex flex-col">
                        {role !== "member" && (
                            <div className="pb-2">
                                <CreateForumButton onCreatePost={handleCreatePost} />
                            </div>
                        )}
                        {role !== "member" && (
                            <div className="pb-2">
                                <ClassroomStatus />
                            </div>
                        )}
                        <div>
                            <ClassroomID />
                        </div>
                    </div>

                    <div className="w-3/4">
                        <div className="space-y-4">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <ForumPost
                                        key={post.id}
                                        id={post.id}
                                        role={role}
                                        onDelete={handleDeletePost}
                                    />
                                ))
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