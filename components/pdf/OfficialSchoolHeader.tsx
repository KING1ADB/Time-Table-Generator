import React from 'react';

interface OfficialSchoolHeaderProps {
  schoolName: string;
  academicYear: string;
  documentTitle: string; // e.g. "CLASS TIMETABLE: UPPER SIXTH SCIENCE"
}

export function OfficialSchoolHeader({
  schoolName,
  academicYear,
  documentTitle,
}: OfficialSchoolHeaderProps) {
  return (
    <div className="w-full mb-6 pb-4 border-b-2 border-slate-800 text-slate-900 font-sans print:border-black">
      <div className="grid grid-cols-3 text-center text-xs font-semibold uppercase tracking-wider mb-3">
        {/* Left Subsystem (English) */}
        <div className="space-y-0.5">
          <p className="font-bold">REPUBLIC OF CAMEROON</p>
          <p className="normal-case italic text-[11px] text-slate-700">Peace - Work - Fatherland</p>
          <p className="mt-1 font-bold text-[11px]">MINISTRY OF SECONDARY EDUCATION</p>
        </div>

        {/* Center School Name & Title */}
        <div className="space-y-1">
          <h1 className="text-lg font-extrabold text-slate-900 tracking-wide">{schoolName.toUpperCase()}</h1>
          <p className="text-xs font-bold text-blue-700 underline underline-offset-4 tracking-wide print:text-black">
            {documentTitle}
          </p>
          <p className="text-[11px] font-semibold text-slate-800">ACADEMIC YEAR: {academicYear}</p>
        </div>

        {/* Right Subsystem (French) */}
        <div className="space-y-0.5">
          <p className="font-bold">RÉPUBLIQUE DU CAMEROUN</p>
          <p className="normal-case italic text-[11px] text-slate-700">Paix - Travail - Patrie</p>
          <p className="mt-1 font-bold text-[11px]">MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES</p>
        </div>
      </div>
    </div>
  );
}
