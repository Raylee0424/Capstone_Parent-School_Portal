import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

interface AddLearningResourceCopyModalProps {
	onClose: () => void;
}

interface LearningResourceCopyItem {
	id: number;
	title: string;
}

const AddLearningResourceCopyModal: React.FC<AddLearningResourceCopyModalProps> = ({ onClose }) => {
	const [copies, setCopies] = React.useState<LearningResourceCopyItem[]>([
		{ id: 1, title: 'Learning Resource 1' },
		{ id: 2, title: 'Learning Resource 2' },
		{ id: 3, title: 'Learning Resource 3' },
	]);

	const handleAddCopy = () => {
		const nextNumber = copies.length + 1;
		setCopies((previousCopies) => [
			...previousCopies,
			{
				id: Date.now(),
				title: `Learning Resource ${nextNumber}`,
			},
		]);
	};

	const handleRemoveCopy = (id: number) => {
		setCopies((previousCopies) => previousCopies.filter((copy) => copy.id !== id));
	};

	return (
		<Modal isOpen={true} onClose={onClose} title="Add Learning Resource Copies">
			<div className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
						Name: Learning Resource
					</div>
					<Button
						type="button"
						onClick={handleAddCopy}
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
	);
};

export default AddLearningResourceCopyModal;
