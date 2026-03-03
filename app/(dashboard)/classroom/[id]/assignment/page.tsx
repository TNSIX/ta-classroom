"use client"

import CreateAssignmentButton from "@/components/classroom/assignment/create-assignment-button";
import AssignmentPost from "@/components/classroom/assignment/post";
import ClassroomID from "@/components/classroom/classroom-id";
import ClassroomStatus from "@/components/classroom/classroom-status";
import NonAssignment from "@/components/classroom/assignment/no-post";
import { useState } from "react";

export type role = "creator" | "manager" | "member";

export default function AssignmentPage({ params }: { params: { id: string } }, role = "creator") {
    const [assignments, setAssignments] = useState<any[]>([
        { id: "1" }
    ]);

    const handleCreateAssignment = (newAssignment: any) => {
        setAssignments([newAssignment, ...assignments]);
    };

    const handleDeleteAssignment = (id: string) => {
        setAssignments(assignments.filter((assignment) => assignment.id !== id));
    };

    return (
        <div className="justify-items-center">
            <div className="flex flex-col items-start">
                <div className="flex w-[1200px] min-h-screen mt-8">
                    <div className="w-1/4 flex flex-col">
                        {role !== "member" && (
                            <div className="pb-2">
                                <CreateAssignmentButton onCreatePost={handleCreateAssignment} />
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
                            {assignments.length > 0 ? (
                                assignments.map((assignment) => (
                                    <AssignmentPost
                                        key={assignment.id}
                                        classId={params.id}
                                        assignmentId={assignment.id}
                                        onDelete={handleDeleteAssignment}
                                    />
                                ))
                            ) : (
                                <NonAssignment />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}