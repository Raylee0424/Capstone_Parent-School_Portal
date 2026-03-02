import React from "react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";

type StudentStatus = "ENROLLED" | "TRANSFERRED" | "GRADUATED" | "DROPPED" | "SUSPENDED";

interface StudentFormData {
  firstName: string;
  lastName: string;
  sex: string;
  lrn: string;
  gradeLevel: string;
  section: string;
  status: StudentStatus;
  dateEnrolled: string;
}

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  submitLabel: string;
  formData: StudentFormData;
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>;
}

export const StudentFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  formData,
  setFormData,
}: StudentFormModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          className="w-full px-4 py-3 text-lg border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-(--button-green) placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          className="w-full px-4 py-3 text-lg border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-(--button-green) placeholder-gray-400"
        />
        <select
          value={formData.sex}
          onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
          className="w-full px-4 py-3 text-lg border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-(--button-green)"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <input
          type="text"
          placeholder="LRN Number"
          value={formData.lrn}
          onChange={(e) => setFormData({ ...formData, lrn: e.target.value })}
          className="w-full px-4 py-3 text-lg border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-(--button-green) placeholder-gray-400"
        />
        <select
          value={formData.gradeLevel}
          onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
          className="w-full px-4 py-3 text-lg border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-(--button-green)"
        >
          <option value="Grade 1">Grade 1</option>
          <option value="Grade 2">Grade 2</option>
          <option value="Grade 3">Grade 3</option>
          <option value="Grade 4">Grade 4</option>
          <option value="Grade 5">Grade 5</option>
          <option value="Grade 6">Grade 6</option>
        </select>
        <select
          value={formData.section}
          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
          className="w-full px-4 py-3 text-lg border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-(--button-green)"
        >
          <option value="Section A">Section A</option>
          <option value="Section B">Section B</option>
          <option value="Section C">Section C</option>
          <option value="Section D">Section D</option>
        </select>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
          className="w-full px-4 py-3 text-lg border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-(--button-green)"
        >
          <option value="ENROLLED" className="text-green-600">ENROLLED</option>
          <option value="TRANSFERRED" className="text-yellow-600">TRANSFERRED</option>
          <option value="GRADUATED" className="text-blue-600">GRADUATED</option>
          <option value="DROPPED" className="text-red-600">DROPPED</option>
          <option value="SUSPENDED" className="text-purple-600">SUSPENDED</option>
        </select>
        <input
          type="text"
          placeholder="Date Enrolled (MM/DD/YY)"
          value={formData.dateEnrolled}
          onChange={(e) => setFormData({ ...formData, dateEnrolled: e.target.value })}
          className="w-full px-4 py-3 text-lg border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-(--button-green) placeholder-gray-400"
        />
        <div className="flex justify-end">
          <Button
            onClick={onSubmit}
            className="bg-(--button-green) hover:bg-(--button-hover-green) text-white px-8 py-3 text-lg rounded-full"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
