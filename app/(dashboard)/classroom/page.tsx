import ClassCard from '@/components/classroom/(main)/classroom-card';

export default function ClassroomPage() {
    return (
        <div className='w-full flex flex-col items-center mt-4 md:mt-8 px-4 md:px-8'>
            <div className='w-full max-w-[1600px]'>
                <div className='flex flex-col pb-4'>
                    <h1 className="text-xl text-gray-800">ชั้นเรียนทั้งหมด</h1>
                    <p className='text-gray-500'>ชั้นเรียนทั้งหมดที่คุณได้เข้าร่วม</p>
                </div>

                <div>
                    <div className='flex flex-row flex-wrap gap-6 justify-center sm:justify-start'>
                        <ClassCard />
                        <ClassCard />
                        <ClassCard />
                        <ClassCard />
                        <ClassCard />
                        <ClassCard />
                        <ClassCard />
                        <ClassCard />
                        <ClassCard />
                        <ClassCard />
                        <ClassCard />
                        <ClassCard />
                        <ClassCard />
                    </div>
                </div>
            </div>
        </div>
    );
}