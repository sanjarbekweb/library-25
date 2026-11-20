import { HistoryRepository } from "../repositories/HistoryRepository";
import { ApiError } from "../utils/ApiError";
import {
  copyHistoryQuerySchema,
  barcodeLookupSchema,
  auditLogFilterSchema,
  AuditLogFilterInput,
} from "../schemas/history.schema";

export class HistoryService {
  constructor(private historyRepository: HistoryRepository) {}

  async getUserLoansAndHistory(userId: string) {
    const data = await this.historyRepository.findUserLoansAndHistory(userId);
    if (!data) {
      throw new ApiError(404, "User profile not found", "USER_NOT_FOUND");
    }
    return data;
  }

  async getCopyTraceabilityByBarcode(barcode: string) {
    const parsed = barcodeLookupSchema.safeParse({ barcode });
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid barcode", "VALIDATION_ERROR");
    }

    const detail = await this.historyRepository.findCopyTraceabilityByBarcode(parsed.data.barcode);
    if (!detail) {
      throw new ApiError(404, `No book copy found with barcode "${barcode}"`, "COPY_NOT_FOUND");
    }
    return detail;
  }

  async getCopyHistory(copyId: string) {
    const parsed = copyHistoryQuerySchema.safeParse({ copyId });
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid copy ID", "VALIDATION_ERROR");
    }

    const history = await this.historyRepository.findCopyHistory(parsed.data.copyId);
    if (!history) {
      throw new ApiError(404, "Book copy not found", "COPY_NOT_FOUND");
    }
    return history;
  }

  async getAllAuditLogs(filterInput: AuditLogFilterInput) {
    const parsed = auditLogFilterSchema.safeParse(filterInput);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid filter parameters", "VALIDATION_ERROR");
    }

    return this.historyRepository.findAllAuditLogs(parsed.data);
  }
}
