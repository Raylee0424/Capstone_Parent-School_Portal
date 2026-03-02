import React from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

interface BookCopyModalProps {
  onClose: () => void;
}

const BookCopyModal: React.FC<BookCopyModalProps> = ({ onClose }) => {
  const [filterStatus, setFilterStatus] = React.useState<string>('Status');
  const [copyStatuses, setCopyStatuses] = React.useState<Record<number, string>>({});
  // Mock data based on the UI provided
  const copies = [
    {
      id: 1,
      title: "The New Science Links 1",
      status: "AVAILABLE",
      borrower: null,
      timeBorrowed: "N/A",
      dueDate: "N/A",
      dueColor: "text-gray-400",
    },
    {
      id: 2,
      title: "The New Science Links 2",
      status: "BORROWED",
      borrower: "Pedro Parker",
      timeBorrowed: null,
      dueDate: "04/09/25 10:00 AM",
      dueColor: "text-green-500",
    },
    {
      id: 3,
      title: "The New Science Links 3",
      status: "BORROWED",
      borrower: "Bill Nye",
      timeBorrowed: null,
      dueDate: "04/05/25 10:00 PM",
      dueColor: "text-red-500",
    },
  ];

  return (
  <Modal isOpen={true} onClose={onClose} title="Book Copies">
    <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
      Name: The New Science Links
      </div>
      <div className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
      Subject: Science
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button type="button" className="bg-(--button-green) hover:bg-(--button-hover-green) text-white">
      <Plus className="h-4 w-4" />
      Add Copy
      </Button>
      <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-(--button-green)"
      >
      <option>Status</option>
      <option value="AVAILABLE">Available</option>
      <option value="BORROWED">Borrowed</option>
      </select>
    </div>

    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
      {copies.map((copy, index) => {
      const currentStatus = copyStatuses[copy.id] || copy.status;
      return (
        <div key={copy.id} className="border border-gray-200 rounded-md p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
          <p className="font-semibold text-gray-900">Copy {index + 1}: {copy.title}</p>
          <p className="text-sm text-gray-600">
            {currentStatus === 'AVAILABLE' ? `Time Borrowed: ${copy.timeBorrowed}` : `Borrower: ${copy.borrower}`}
          </p>
          </div>
          <div className="flex items-center gap-2">
          <div className="relative">
            <select
            value={currentStatus}
            onChange={(e) => setCopyStatuses({ ...copyStatuses, [copy.id]: e.target.value })}
            className="appearance-none rounded-full border border-gray-300 px-4 py-1 pr-8 text-sm font-semibold"
            >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="BORROWED">BORROWED</option>
            <option value="LOST">LOST</option>
            </select>
            <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <span className={`text-xs font-semibold ${copy.dueColor}`}>Due: {copy.dueDate}</span>
          </div>
        </div>
        </div>
      );
      })}
    </div>
    </div>
  </Modal>
  );
};

export default BookCopyModal;