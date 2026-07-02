import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Task } from '../types/task';

vi.mock('../api/taskApi', () => ({
	getTasks: vi.fn(),
	createTask: vi.fn(),
	updateTask: vi.fn(),
	deleteTask: vi.fn(),
}));

import * as taskApi from '../api/taskApi';
import { useTasks } from '../hooks/useTasks';

const mockedApi = vi.mocked(taskApi);

const taskA: Task = {
	id: 1,
	title: 'A',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('useTasks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads tasks on mount', async () => {
		mockedApi.getTasks.mockResolvedValue([taskA]);

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.tasks).toEqual([taskA]);
		expect(result.current.error).toBeNull();
	});

	it('sets an error message when loading fails', async () => {
		mockedApi.getTasks.mockRejectedValue(new Error('network down'));

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe('network down');
	});

	it('adds a new task at the top of the list', async () => {
		mockedApi.getTasks.mockResolvedValue([]);
		const created = { ...taskA, id: 2, title: 'New' };
		mockedApi.createTask.mockResolvedValue(created);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.addTask({ title: 'New' });
		});

		expect(result.current.tasks[0]).toEqual(created);
	});

	it('edits an existing task', async () => {
		mockedApi.getTasks.mockResolvedValue([taskA]);
		const updated = { ...taskA, title: 'Updated' };
		mockedApi.updateTask.mockResolvedValue(updated);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.editTask(1, { title: 'Updated' });
		});

		expect(result.current.tasks[0].title).toBe('Updated');
	});

	it('removes a task', async () => {
		mockedApi.getTasks.mockResolvedValue([taskA]);
		mockedApi.deleteTask.mockResolvedValue(undefined);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.removeTask(1);
		});

		expect(result.current.tasks).toEqual([]);
	});

	it('toggles the completed state of a task', async () => {
		mockedApi.getTasks.mockResolvedValue([taskA]);
		mockedApi.updateTask.mockResolvedValue({ ...taskA, completed: true });

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(1);
		});

		expect(mockedApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
		expect(result.current.tasks[0].completed).toBe(true);
	});
});
