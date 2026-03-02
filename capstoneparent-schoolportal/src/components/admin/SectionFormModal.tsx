import React from "react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";

interface SectionFormData {
  name: string;
  adviser: string;
  students: number;
}

interface SectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  submitLabel: string;
  formData: SectionFormData;
  setFormData: React.Dispatch<React.SetStateAction<SectionFormData>>;
}

export const SectionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  formData,
  setFormData,
}: SectionFormModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Section name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 text-lg border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-(--button-green) placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="Adviser name"
          value={formData.adviser}
          onChange={(e) => setFormData({ ...formData, adviser: e.target.value })}
          className="w-full px-4 py-3 text-lg border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-(--button-green) placeholder-gray-400"
        />
        <input
          type="number"
          placeholder="Number of students"
          value={formData.students || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              students: parseInt(e.target.value) || 0,
            })
          }
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
