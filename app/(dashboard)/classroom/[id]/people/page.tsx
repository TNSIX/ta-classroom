import PeopleTable from "@/components/classroom/people/people-table";

export default function PeoplePage() {
    return (
        <div className="justify-items-center min-h-screen">
            <div className="flex flex-col w-[1200px] mt-8">
                <PeopleTable />
            </div>
        </div>
    );
}