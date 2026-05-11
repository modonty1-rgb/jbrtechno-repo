'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@jbrtechno/database';
import { UserRole, TaskStatus, TaskPriority } from '@jbrtechno/database';
import { revalidatePath } from 'next/cache';

export interface GetUserTasksResult {
  success: boolean;
  tasks?: any[];
  error?: string;
}

export interface CreateTaskResult {
  success: boolean;
  taskId?: string;
  error?: string;
}

export interface UpdateTaskStatusResult {
  success: boolean;
  error?: string;
}

export interface UpdateTaskResult {
  success: boolean;
  error?: string;
}

export interface DeleteTaskResult {
  success: boolean;
  error?: string;
}

export async function getUserTasks(userId: string): Promise<GetUserTasksResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const tasks = await prisma.task.findMany({
      where: {
        assignedToUserId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      tasks,
    };
  } catch (error) {
    console.error('Error getting user tasks:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tasks',
    };
  }
}

export async function getNewTasks(userId: string): Promise<GetUserTasksResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const tasks = await prisma.task.findMany({
      where: {
        assignedToUserId: userId,
        status: {
          in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return {
      success: true,
      tasks,
    };
  } catch (error) {
    console.error('Error getting new tasks:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get new tasks',
    };
  }
}

export async function createTask(data: {
  title: string;
  description?: string;
  assignedToUserId: string;
  priority?: string;
  dueDate?: Date | string;
}): Promise<CreateTaskResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userRole = session.user.role as UserRole;

    if (userRole !== UserRole.SUPER_ADMIN) {
      return { success: false, error: 'Only super admins can create tasks' };
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        assignedToUserId: data.assignedToUserId,
        createdByUserId: session.user.id,
        status: TaskStatus.PENDING,
        priority: (data.priority as TaskPriority) || TaskPriority.MEDIUM,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    revalidatePath('/[locale]/admin', 'page');

    return {
      success: true,
      taskId: task.id,
    };
  } catch (error) {
    console.error('Error creating task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    };
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: string,
  userId: string
): Promise<UpdateTaskStatusResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    if (task.assignedToUserId !== userId) {
      return { success: false, error: 'You can only update your own tasks' };
    }

    const updateData: any = {
      status: status as TaskStatus,
    };

    if (status === TaskStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (status !== TaskStatus.COMPLETED && task.completedAt) {
      updateData.completedAt = null;
    }

    await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    revalidatePath('/[locale]/admin', 'page');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating task status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task status',
    };
  }
}

export async function getAllTasks(): Promise<GetUserTasksResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userRole = session.user.role as UserRole;

    if (userRole !== UserRole.SUPER_ADMIN) {
      return { success: false, error: 'Only super admins can view all tasks' };
    }

    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      tasks,
    };
  } catch (error) {
    console.error('Error getting all tasks:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get all tasks',
    };
  }
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    assignedToUserId?: string;
    priority?: string;
    dueDate?: Date | string | null;
    status?: string;
  }
): Promise<UpdateTaskResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userRole = session.user.role as UserRole;

    if (userRole !== UserRole.SUPER_ADMIN) {
      return { success: false, error: 'Only super admins can update tasks' };
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.assignedToUserId !== undefined) updateData.assignedToUserId = data.assignedToUserId;
    if (data.priority !== undefined) updateData.priority = data.priority as TaskPriority;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.status !== undefined) {
      updateData.status = data.status as TaskStatus;
      if (data.status === TaskStatus.COMPLETED && !task.completedAt) {
        updateData.completedAt = new Date();
      } else if (data.status !== TaskStatus.COMPLETED && task.completedAt) {
        updateData.completedAt = null;
      }
    }

    await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    revalidatePath('/[locale]/admin/tasks', 'page');
    revalidatePath('/[locale]/admin/tasks/my-tasks', 'page');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task',
    };
  }
}

export async function deleteTask(taskId: string): Promise<DeleteTaskResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userRole = session.user.role as UserRole;

    if (userRole !== UserRole.SUPER_ADMIN) {
      return { success: false, error: 'Only super admins can delete tasks' };
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath('/[locale]/admin/tasks', 'page');
    revalidatePath('/[locale]/admin/tasks/my-tasks', 'page');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete task',
    };
  }
}








