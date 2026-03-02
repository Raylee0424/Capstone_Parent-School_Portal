import { Button } from "../ui/button";
import { Modal } from "../ui/modal";

interface StaffDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  staffName?: string;
}

export const StaffDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  staffName,
}: StaffDeleteModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Staff">
      <div className="space-y-4">
        <p className="text-lg">
          Are you sure you want to delete <strong>{staffName}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
