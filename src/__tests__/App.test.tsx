import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Task } from '../types/task';

const addTask = vi.fn();
const editTask = vi.fn();
const removeTask = vi.fn();
const toggleComplete = vi.fn();

let hookState: {
	tasks: Task[];
	loading: boolean;
	error: string | null;
};

vi.mock('../hooks/useTasks', () => ({
	useTasks: () => ({
		...hookState,
		addTask,
		editTask,
		removeTask,
		toggleComplete,
	}),
}));

import App from '../App';

const tasks: Task[] = [
	{
		id: 1,
		title: 'Tâche 1',
		description: null,
		completed: false,
		createdAt: '2026-01-15T10:00:00Z',
		updatedAt: '2026-01-15T10:00:00Z',
	},
	{
		id: 2,
		title: 'Tâche 2',
		description: null,
		completed: true,
		createdAt: '2026-01-16T10:00:00Z',
		updatedAt: '2026-01-16T10:00:00Z',
	},
];

describe('App', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		hookState = { tasks, loading: false, error: null };
	});

	it('renders the header and the task statistics', () => {
		render(<App />);

		expect(screen.getByText('Mes Tâches')).toBeInTheDocument();
		expect(screen.getByText('Total')).toBeInTheDocument();
		expect(screen.getByText('Terminées')).toBeInTheDocument();
		expect(screen.getByText('En cours')).toBeInTheDocument();
	});

	it('does not render statistics when there is no task', () => {
		hookState = { tasks: [], loading: false, error: null };
		render(<App />);

		expect(screen.queryByText('Total')).not.toBeInTheDocument();
	});

	it('calls addTask when the form is submitted', async () => {
		render(<App />);

		await userEvent.type(screen.getByLabelText('Titre'), 'Nouvelle');
		await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(addTask).toHaveBeenCalledWith({
			title: 'Nouvelle',
			description: undefined,
		});
	});
});
