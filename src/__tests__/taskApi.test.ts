import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getTasks,
	getTask,
	createTask,
	updateTask,
	deleteTask,
} from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
	const fn = vi.fn().mockResolvedValue(response);
	vi.stubGlobal('fetch', fn);
	return fn;
}

beforeEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe('taskApi', () => {
	it('getTasks returns the array of tasks', async () => {
		const fn = mockFetch({ ok: true, json: () => Promise.resolve([mockTask]) });

		const tasks = await getTasks();

		expect(tasks).toEqual([mockTask]);
		expect(fn).toHaveBeenCalledWith('/api/tasks');
	});

	it('getTask returns a single task by id', async () => {
		const fn = mockFetch({ ok: true, json: () => Promise.resolve(mockTask) });

		const task = await getTask(1);

		expect(task).toEqual(mockTask);
		expect(fn).toHaveBeenCalledWith('/api/tasks/1');
	});

	it('createTask posts the payload as JSON', async () => {
		const fn = mockFetch({ ok: true, json: () => Promise.resolve(mockTask) });

		const task = await createTask({ title: 'Test' });

		expect(task).toEqual(mockTask);
		expect(fn).toHaveBeenCalledWith('/api/tasks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title: 'Test' }),
		});
	});

	it('updateTask sends a PUT request to the right url', async () => {
		const fn = mockFetch({ ok: true, json: () => Promise.resolve(mockTask) });

		await updateTask(1, { completed: true });

		expect(fn).toHaveBeenCalledWith('/api/tasks/1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ completed: true }),
		});
	});

	it('deleteTask sends a DELETE request', async () => {
		const fn = mockFetch({ ok: true, text: () => Promise.resolve('') });

		await deleteTask(1);

		expect(fn).toHaveBeenCalledWith('/api/tasks/1', { method: 'DELETE' });
	});

	it('throws an error when the response is not ok', async () => {
		mockFetch({
			ok: false,
			status: 500,
			text: () => Promise.resolve('Internal Server Error'),
		});

		await expect(getTasks()).rejects.toThrow('HTTP 500');
	});

	it('deleteTask throws when the response is not ok', async () => {
		mockFetch({
			ok: false,
			status: 404,
			text: () => Promise.resolve('Not Found'),
		});

		await expect(deleteTask(99)).rejects.toThrow('HTTP 404');
	});
});
