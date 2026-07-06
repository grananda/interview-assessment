import { NotFoundException } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from '../services/tasks.service';
import { Task } from '../entities/task.entity';
import { TaskStatus } from '@repo/shared';
import { TaskNotFoundError } from '../errors/task-not-found.error';

describe('TasksController', () => {
  let controller: TasksController;
  let service: {
    findAll: jest.Mock;
    findById: jest.Mock;
    updateStatus: jest.Mock;
  };

  const buildTask = (): Task => {
    const task = new Task();
    task.id = 1;
    task.title = 'Wire the tasks endpoint';
    task.description = 'Return the task list from the service';
    task.status = TaskStatus.InProgress;
    task.createdAt = '2026-02-01T12:30:00.000Z';
    return task;
  };

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };
    controller = new TasksController(service as unknown as TasksService);
  });

  it('maps the domain task list to response DTOs and forwards the status filter', async () => {
    service.findAll.mockResolvedValue([buildTask()]);

    const result = await controller.findAll({ status: TaskStatus.InProgress });

    expect(service.findAll).toHaveBeenCalledWith(TaskStatus.InProgress);
    expect(result).toEqual([
      expect.objectContaining({ id: 1, createdAt: '2026-02-01' }),
    ]);
  });

  it('returns a single response DTO when the task exists', async () => {
    service.findById.mockResolvedValue(buildTask());

    const result = await controller.findOne(1);

    expect(service.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(
      expect.objectContaining({ id: 1, createdAt: '2026-02-01' }),
    );
  });

  it('translates the domain TaskNotFoundError into an HTTP 404', async () => {
    service.findById.mockRejectedValue(new TaskNotFoundError(99));

    await expect(controller.findOne(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('re-throws unrelated errors untouched', async () => {
    const boom = new Error('db exploded');
    service.findById.mockRejectedValue(boom);

    await expect(controller.findOne(1)).rejects.toBe(boom);
  });

  // TODO (candidate): make these pass by implementing PUT /api/tasks/:id/status.
  describe('updateStatus', () => {
    it('updates the status and returns the mapped response DTO', async () => {
      service.updateStatus.mockResolvedValue(buildTask());

      const result = await controller.updateStatus(1, {
        status: TaskStatus.Done,
      });

      expect(service.updateStatus).toHaveBeenCalledWith(1, TaskStatus.Done);
      expect(result).toEqual(
        expect.objectContaining({ id: 1, createdAt: '2026-02-01' }),
      );
    });

    it('translates the domain TaskNotFoundError into an HTTP 404', async () => {
      service.updateStatus.mockRejectedValue(new TaskNotFoundError(99));

      await expect(
        controller.updateStatus(99, { status: TaskStatus.Done }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('re-throws unrelated errors untouched', async () => {
      const boom = new Error('db exploded');
      service.updateStatus.mockRejectedValue(boom);

      await expect(
        controller.updateStatus(1, { status: TaskStatus.Done }),
      ).rejects.toBe(boom);
    });
  });
});
