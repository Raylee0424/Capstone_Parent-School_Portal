import React from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

interface BorrowerModalProps {
	onClose: () => void;
	onConfirm?: (borrowerName: string) => void;
	title?: string;
	placeholder?: string;
	initialValue?: string;
	confirmLabel?: string;
	cancelLabel?: string;
}

const BorrowerModal: React.FC<BorrowerModalProps> = ({
	onClose,
	onConfirm,
	title = 'Name of Borrower',
	placeholder = 'Input Name',
	initialValue = '',
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
}) => {
	const [borrowerName, setBorrowerName] = React.useState(initialValue);

	const handleConfirm = () => {
		onConfirm?.(borrowerName.trim());
		onClose();
	};

	return (
		<Modal isOpen={true} onClose={onClose} title={title}>
			<div className="space-y-4">
				<input
					type="text"
					value={borrowerName}
					onChange={(event) => setBorrowerName(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							handleConfirm();
						}
					}}
					placeholder={placeholder}
					className="w-full px-4 py-3 text-lg border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-(--button-green) placeholder-gray-400"
				/>
				<div className="flex justify-end gap-3">
					<Button
						type="button"
						onClick={onClose}
						className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg rounded-full"
					>
						{cancelLabel}
					</Button>
					<Button
						type="button"
						onClick={handleConfirm}
						className="bg-(--button-green) hover:bg-(--button-hover-green) text-white px-8 py-3 text-lg rounded-full"
					>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default BorrowerModal;
