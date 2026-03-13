import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, X, ArrowLeft, Plus } from 'lucide-react';
import type { ClassItem, SubjectItem } from '@/Pages/principal-pages/types';

interface SubjectsProps {
  selectedClass: ClassItem;
  subjects: SubjectItem[];
  isLoadingSubjects: boolean;
  onBack: () => void;
  onAssignTeacher: (subject: SubjectItem) => void;
  onRemoveSubject: (subject: SubjectItem) => void;
  onAddSubject: () => void;
  onAssignAdviser: () => void;
}

export const Subjects = ({
  selectedClass,
  subjects,
  isLoadingSubjects,
  onBack,
  onAssignTeacher,
  onRemoveSubject,
  onAddSubject,
  onAssignAdviser,
}: SubjectsProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter subjects by search
  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* First Row: Back Button, Search, Class Adviser */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex gap-3 items-center flex-1 w-full">
            <Button 
              className="bg-(--button-green) hover:bg-green-700 text-white"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300"
              />
            </div>
          </div>

          <div className="px-4 py-2 bg-white border border-gray-300 rounded-md whitespace-nowrap">
            <span className="font-semibold">Assigned Class Adviser: </span>
            <span>{selectedClass.teacher_name || 'Not Assigned'}</span>
          </div>
        </div>

        {/* Second Row: Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button 
            className="bg-(--button-green) hover:bg-green-700 text-white"
            onClick={onAddSubject}
          >
            <Plus className="h-5 w-5" />
            Add Subject
          </Button>
          <Button 
            className="bg-(--button-green) hover:bg-green-700 text-white"
            onClick={onAssignAdviser}
          >
            <UserPlus className="h-5 w-5" />
            Assign Class Adviser
          </Button>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Subject Name
                </th>
                <th className="px-6 py-3 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Assigned Teacher
                </th>
                <th className="px-6 py-3 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingSubjects ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    Loading subjects...
                  </td>
                </tr>
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="px-6 py-2 text-left">
                      {subject.name}
                    </td>
                    <td className="px-6 py-2 text-center">
                      {subject.teacher_name || '-'}
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onAssignTeacher(subject)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          title="Assign Teacher"
                        >
                          <UserPlus className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => onRemoveSubject(subject)}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors"
                          title="Remove Subject"
                        >
                          <X className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No subjects found for this class
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};