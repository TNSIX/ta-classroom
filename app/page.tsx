'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {


  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">


      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Radial Gradient overlay to fade grid edges */}
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>

      {/* Logo / Title Area */}
      <div className="flex flex-col items-center mb-16 space-y-2 relative z-10">
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 drop-shadow-sm select-none">
          Teacher Assistant
        </h1>
        <h2 className="text-4xl font-bold tracking-[0.8em] text-gray-800 select-none">
          CLASSROOM
        </h2>
        <p className="mt-6 text-slate-500 text-lg max-w-md text-center font-light select-none">
          {'<'} เริ่มต้นใช้งานระบบจัดการห้องเรียนกับเรา {'/>'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 items-center w-full max-w-md px-6 mt-8 relative z-10">
        <Link
          href="/login"
          className="group relative w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-lg rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
        >
          <span>เข้าสู่ระบบ</span>
          <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/register"
          className="group w-full flex items-center justify-center px-4 py-3 bg-white text-blue-600 text-lg rounded-xl border border-blue-200 shadow-sm hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 hover:-translate-y-0.5"
        >
          สมัครบัญชีผู้ใช้งาน
        </Link>
      </div>

      {/* Footer / Copyright */}
      <div className="absolute bottom-6 text-sm text-slate-400 font-light z-10 select-none">
        © 2026 Teacher Assistant Classroom. All rights reserved.
      </div>
    </div>
  );
}
