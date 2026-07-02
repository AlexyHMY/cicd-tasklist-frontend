import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const baseTask: Task = {
	id: 1,
	title: 'Ma tâche',
	description: 'Une description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
	it('renders the task title and description', () => {
		render(
			<TaskItem
				task={baseTask}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);

		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
		expect(screen.getByText('Une description')).toBeInTheDocument();
	});

	it('calls onToggle when the checkbox is clicked', async () => {
		const onToggle = vi.fn();
		render(
			<TaskItem
				task={baseTask}
				onToggle={onToggle}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);

		await userEvent.click(screen.getByRole('checkbox'));
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('edits the task and calls onEdit with the new values', async () => {
		const onEdit = vi.fn();
		render(
			<TaskItem
				task={baseTask}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={onEdit}
			/>
		);

		await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await userEvent.clear(titleInput);
		await userEvent.type(titleInput, 'Titre modifié');
		await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Titre modifié',
			description: 'Une description',
		});
	});

	it('restores the original values when edit is cancelled', async () => {
		const onEdit = vi.fn();
		render(
			<TaskItem
				task={baseTask}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={onEdit}
			/>
		);

		await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));
		await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));

		expect(onEdit).not.toHaveBeenCalled();
		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
	});
});

describe('TaskItem delete confirmation', () => {
	it('requires a second click to confirm deletion', async () => {
		const onDelete = vi.fn();
		render(
			<TaskItem
				task={baseTask}
				onToggle={vi.fn()}
				onDelete={onDelete}
				onEdit={vi.fn()}
			/>
		);

		const deleteButton = screen.getByRole('button', { name: 'Supprimer' });
		await userEvent.click(deleteButton);
		expect(onDelete).not.toHaveBeenCalled();

		await userEvent.click(deleteButton);
		expect(onDelete).toHaveBeenCalledWith(1);
	});
});
