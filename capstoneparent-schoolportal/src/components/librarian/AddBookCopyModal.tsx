import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AddNumberOfCopiesModal from './AddNumberOfCopiesModal';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

interface AddBookCopyModalProps {
	onClose: () => void;
}

interface BookCopyItem {
	id: number;
	title: string;
}

const AddBookCopyModal: React.FC<AddBookCopyModalProps> = ({ onClose }) => {
	const [copies, setCopies] = React.useState<BookCopyItem[]>([
		{ id: 1, title: 'The New Science Links 1' },
		{ id: 2, title: 'The New Science Links 2' },
		{ id: 3, title: 'The New Science Links 3' },
	]);
	const [isAddNumberModalOpen, setIsAddNumberModalOpen] = React.useState(false);

	const handleAddCopies = (numberOfCopies: number) => {
		setCopies((previousCopies) => {
			const nextNumber = previousCopies.length + 1;
			const newCopies = Array.from({ length: numberOfCopies }, (_, index) => ({
				id: Date.now() + index,
				title: `The New Science Links ${nextNumber + index}`,
			}));

			return [...previousCopies, ...newCopies];
		});
	};

	const handleRemoveCopy = (id: number) => {
		setCopies((previousCopies) => previousCopies.filter((copy) => copy.id !== id));
	};

	return (
		<>
			<Modal isOpen={true} onClose={onClose} title="Add Book Copies">
				<div className="space-y-4">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
							Name: The New Science Links
						</div>
						<Button
							type="button"
							onClick={() => setIsAddNumberModalOpen(true)}
							className="bg-(--button-green) hover:bg-(--button-hover-green) text-white"
						>
							<Plus className="h-4 w-4" />
							Add Copy
						</Button>
					</div>

					<div className="max-h-80 overflow-y-auto space-y-3 border border-gray-200 rounded-md p-3">
						{copies.map((copy) => (
							<div key={copy.id} className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-4 py-3">
								<span className="text-sm font-medium text-gray-800">{copy.title}</span>
								<button
									type="button"
									onClick={() => handleRemoveCopy(copy.id)}
									className="text-red-600 hover:text-red-700 cursor-pointer"
									aria-label={`Remove ${copy.title}`}
								>
									<Trash2 className="h-5 w-5" />
								</button>
							</div>
						))}
					</div>
					<div className="flex justify-end">
						<Button
							type="button"
							onClick={onClose}
							className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg rounded-full"
						>
							Done
						</Button>
					</div>
				</div>
			</Modal>

			{isAddNumberModalOpen && (
				<AddNumberOfCopiesModal
					onClose={() => setIsAddNumberModalOpen(false)}
					onAdd={handleAddCopies}
				/>
			)}
		</>
	);
};

export default AddBookCopyModal;
