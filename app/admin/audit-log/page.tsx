"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  actor: { name: string; email: string };
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    apiFetch("/api/admin/audit-logs")
      .then((res) => res.json())
      .then((data) => setLogs(data.logs ?? []));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Audit Log</h1>

      <Table className="mt-6">
        <Thead>
          <Tr>
            <Th>Action</Th>
            <Th>Target</Th>
            <Th>Actor</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {logs.map((log) => (
            <Tr key={log.id}>
              <Td className="font-medium text-foreground">{log.action}</Td>
              <Td className="text-muted">{log.targetType} &middot; {log.targetId.slice(-8)}</Td>
              <Td>{log.actor.name}</Td>
              <Td>{formatDate(log.createdAt)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {logs.length === 0 && <p className="mt-6 text-muted">No audit events recorded yet.</p>}
    </div>
  );
}
