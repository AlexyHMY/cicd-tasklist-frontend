import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('shows a validation error when submitting an empty title', async () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('submits the trimmed title and description', async () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await userEvent.type(screen.getByLabelText('Titre'), '  Ma tâche  ');
		await userEvent.type(screen.getByLabelText('Description'), '  Détails  ');
		await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Ma tâche',
			description: 'Détails',
		});
	});

	it('submits without description when it is empty', async () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await userEvent.type(screen.getByLabelText('Titre'), 'Titre seul');
		await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Titre seul',
			description: undefined,
		});
	});

	it('clears the form after a create submission', async () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		const input = screen.getByLabelText('Titre') as HTMLInputElement;
		await userEvent.type(input, 'Titre');
		await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(input.value).toBe('');
	});

	it('renders edit mode with initial values and a cancel button', async () => {
		const onCancel = vi.fn();
		render(
			<TaskForm
				mode="edit"
				initialValues={{ title: 'Existant', description: 'desc' }}
				onSubmit={vi.fn()}
				onCancel={onCancel}
			/>
		);

		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		expect((screen.getByLabelText('Titre') as HTMLInputElement).value).toBe(
			'Existant'
		);

		await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
		expect(onCancel).toHaveBeenCalled();
	});
});
