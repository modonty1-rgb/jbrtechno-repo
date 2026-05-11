"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';

interface ClockifyUserRow {
  id: string;
  email: string;
  name: string;
  status: string;
}

interface ClockifyUsersTableProps {
  users: ClockifyUserRow[];
  isArabic: boolean;
}

export function ClockifyUsersTable({ users, isArabic }: ClockifyUsersTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // swallow error; clipboard might be blocked
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isArabic ? 'مستخدمو Clockify' : 'Clockify Users'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {isArabic
            ? 'انسخ معرف المستخدم (ID) والصقه في حقل معرف مستخدم Clockify في صفحة تفاصيل الموظف أو صفحة المستخدم.'
            : 'Copy the user ID and paste it into the Clockify User ID field on the staff or user detail page.'}
        </p>

        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground" dir={isArabic ? 'rtl' : 'ltr'}>
            {isArabic
              ? 'لا يوجد مستخدمون في مساحة العمل هذه.'
              : 'No users found in this workspace.'}
          </p>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    {isArabic ? 'الاسم' : 'Name'}
                  </TableHead>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    Email
                  </TableHead>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    ID
                  </TableHead>
                  <TableHead className={isArabic ? 'text-right' : 'text-left'}>
                    {isArabic ? 'الحالة' : 'Status'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="align-top">
                    <TableCell className="font-medium" dir={isArabic ? 'rtl' : 'ltr'}>
                      {user.name}
                    </TableCell>
                    <TableCell dir={isArabic ? 'rtl' : 'ltr'}>{user.email}</TableCell>
                    <TableCell className="font-mono text-xs break-all" dir="ltr">
                      <div className="flex items-center gap-2">
                        <span className="break-all">{user.id}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(user.id)}
                        >
                          {copiedId === user.id
                            ? isArabic ? 'تم النسخ' : 'Copied'
                            : isArabic ? 'نسخ' : 'Copy'}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell dir={isArabic ? 'rtl' : 'ltr'}>{user.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


