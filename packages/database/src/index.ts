export { prisma } from "./client";

export {
  PrismaClient,
  Prisma,
  ApplicationStatus,
  RequirementStatus,
  RequirementPriority,
  TransactionType,
  InterviewResultStatus,
  StaffStatus,
  SalaryMode,
  AdjustmentType,
  UserRole,
  CategoryType,
  TaskStatus,
  TaskPriority,
  NoteType,
  TargetAudience,
  ActivityType,
} from "@prisma/client";

export type {
  Application,
  Phase1Requirement,
  Transaction,
  ContactMessage,
  InterviewResult,
  Staff,
  StaffAdjustment,
  PayrollRun,
  User,
  UserRoutePermission,
  Category,
  Task,
  ManagementNote,
  Position,
  ActivityLog,
} from "@prisma/client";
