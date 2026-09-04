/**
 * Action & Audit Logger for CartPilot AI Agent
 * Tracks agent reasoning summary, tools/actions taken,
 * parameters, results, and timestamps.
 */

class AuditLogger {
  constructor() {
    try {
      const savedLogs = localStorage.getItem('cartpilot_audit_logs');
      this.logs = savedLogs ? JSON.parse(savedLogs) : [];
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      this.logs = [];
    }

    this.listeners = new Set();
  }

  log({
    userQuery = '',
    reasoningSummary = '',
    toolName = 'none',
    toolInput = {},
    toolResult = {},
    matchedProductIds = [],
    status = 'SUCCESS',
    executionMs = 0
  }) {
    const entry = {
      id: `audit-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)}`,

      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),

      isoTime: new Date().toISOString(),
      userQuery,
      reasoningSummary,
      toolName,
      toolInput,
      toolResult,
      matchedProductIds,
      status,
      executionMs
    };

    // Most recent log first
    this.logs.unshift(entry);

    // Keep maximum 50 audit records
    if (this.logs.length > 50) {
      this.logs.pop();
    }

    // Save audit trail to browser storage
    this.saveLogs();

    // Update dashboard listeners
    this.notifyListeners();

    return entry;
  }

  getLogs() {
    return [...this.logs];
  }

  getRecentLogs(limit = 10) {
    return this.logs.slice(0, limit);
  }

  clear() {
    this.logs = [];
    this.saveLogs();
    this.notifyListeners();
  }

  saveLogs() {
    try {
      localStorage.setItem(
        'cartpilot_audit_logs',
        JSON.stringify(this.logs)
      );
    } catch (error) {
      console.error('Failed to save audit logs:', error);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.logs);
      } catch (err) {
        console.error('Error in audit listener:', err);
      }
    }
  }
}

export const auditLogger = new AuditLogger();