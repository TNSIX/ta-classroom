
import AssignmentHeader from "@/components/classroom/assignment/assignment-header";

interface AssignmentLayoutProps {
    children: React.ReactNode;
    params: {
        id: string;
        assignment_id: string;
    };
}

export default function AssignmentLayout({
    children,
    params,
}: AssignmentLayoutProps) {
    return (
        <div className="w-full">
            <AssignmentHeader />
            <div>
                {children}
            </div>
        </div>
    );
}
