'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@jbrtechno/ui';
import { InterviewCard } from './InterviewCard';
import { Loader2, CalendarClock, AlertCircle } from 'lucide-react';
import { Application } from '@jbrtechno/database';

interface InterviewApplication extends Omit<Application, 'scheduledInterviewDate' | 'interviewResponseSubmittedAt'> {
  scheduledInterviewDate: Date | string | null;
  interviewResponseSubmittedAt: Date | string | null;
  interviewResult?: {
    result: 'PASSED' | 'FAILED' | 'PENDING';
  } | null;
}

interface InterviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
}

export function InterviewsModal({ open, onOpenChange, locale }: InterviewsModalProps) {
  const [interviews, setInterviews] = useState<InterviewApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const isArabic = true;

  useEffect(() => {
    if (open) {
      fetchInterviews();
    }
  }, [open]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/applications/interviews');
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-2xl">
              {isArabic ? 'المقابلات' : 'Interviews'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : interviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {isArabic ? 'لا توجد مقابلات' : 'No interviews found'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {isArabic
                  ? 'لا توجد مقابلات مجدولة أو استجابات مقابلة حتى الآن'
                  : 'No scheduled interviews or interview responses yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  application={{
                    id: interview.id,
                    applicantName: interview.applicantName,
                    position: interview.position,
                    phone: interview.phone,
                    profileImageUrl: interview.profileImageUrl,
                    scheduledInterviewDate: interview.scheduledInterviewDate,
                    interviewResponseSubmittedAt: interview.interviewResponseSubmittedAt,
                    appointmentConfirmed: interview.appointmentConfirmed ?? false,
                    lastSalary: interview.lastSalary || null,
                    expectedSalary: interview.expectedSalary || null,
                  }}
                  interviewResult={interview.interviewResult || null}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
















