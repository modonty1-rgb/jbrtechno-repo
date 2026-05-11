'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@jbrtechno/ui';
import { Input } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import { Textarea } from '@jbrtechno/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { ArrowLeft, Loader2, Save, X } from 'lucide-react';
import { createOrUpdateInterviewResult } from '@/actions/interviewResult';
import { formatDateTimeWithArabicTime } from '@/helpers/formatDateTime';

interface InterviewResultFormProps {
  applicationId: string;
  application: {
    applicantName: string;
    position: string;
    profileImageUrl: string;
  };
  existingResult?: {
    id: string;
    interviewDate: Date | string;
    result: 'PASSED' | 'FAILED' | 'PENDING';
    rating: number | null;
    interviewerName: string | null;
    strengths: string[];
    weaknesses: string[];
    notes: string | null;
    recommendation: string | null;
  } | null;
  locale: string;
}

export function InterviewResultForm({
  applicationId,
  application,
  existingResult,
  locale,
}: InterviewResultFormProps) {
  const router = useRouter();
  const isArabic = true;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    interviewDate: existingResult
      ? new Date(existingResult.interviewDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    result: existingResult?.result || 'PENDING',
    rating: existingResult?.rating?.toString() || '',
    interviewerName: existingResult?.interviewerName || '',
    strengths: existingResult?.strengths.join('\n') || '',
    weaknesses: existingResult?.weaknesses.join('\n') || '',
    notes: existingResult?.notes || '',
    recommendation: existingResult?.recommendation || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const strengthsArray = formData.strengths
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const weaknessesArray = formData.weaknesses
        .split('\n')
        .map((w) => w.trim())
        .filter((w) => w.length > 0);

      const result = await createOrUpdateInterviewResult({
        applicationId,
        interviewDate: new Date(formData.interviewDate),
        result: formData.result as 'PASSED' | 'FAILED' | 'PENDING',
        rating: formData.rating ? parseInt(formData.rating, 10) : undefined,
        interviewerName: formData.interviewerName || undefined,
        strengths: strengthsArray,
        weaknesses: weaknessesArray,
        notes: formData.notes || undefined,
        recommendation: formData.recommendation || undefined,
      });

      if (result.success) {
        router.push('/applications/interviews');
        router.refresh();
      } else {
        setError(result.error || (isArabic ? 'فشل في حفظ النتيجة' : 'Failed to save result'));
      }
    } catch (err) {
      setError(isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="interviewDate">
            {isArabic ? 'تاريخ المقابلة' : 'Interview Date'} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="interviewDate"
            type="date"
            value={formData.interviewDate}
            onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="result">
            {isArabic ? 'النتيجة' : 'Result'} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.result}
            onValueChange={(value) => setFormData({ ...formData, result: value as 'PASSED' | 'FAILED' | 'PENDING' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PASSED">{isArabic ? 'نجح' : 'Passed'}</SelectItem>
              <SelectItem value="FAILED">{isArabic ? 'فشل' : 'Failed'}</SelectItem>
              <SelectItem value="PENDING">{isArabic ? 'قيد المراجعة' : 'Pending'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">
            {isArabic ? 'التقييم (1-10)' : 'Rating (1-10)'}
          </Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="10"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            placeholder={isArabic ? 'من 1 إلى 10' : '1 to 10'}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interviewerName">
            {isArabic ? 'اسم المقابل' : 'Interviewer Name'}
          </Label>
          <Input
            id="interviewerName"
            value={formData.interviewerName}
            onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
            placeholder={isArabic ? 'اسم المقابل' : 'Interviewer name'}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="strengths">
          {isArabic ? 'نقاط القوة' : 'Strengths'}
        </Label>
        <Textarea
          id="strengths"
          value={formData.strengths}
          onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
          placeholder={isArabic ? 'أدخل نقاط القوة (سطر واحد لكل نقطة)' : 'Enter strengths (one per line)'}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          {isArabic ? 'أدخل كل نقطة قوة في سطر منفصل' : 'Enter each strength on a separate line'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weaknesses">
          {isArabic ? 'نقاط الضعف' : 'Weaknesses'}
        </Label>
        <Textarea
          id="weaknesses"
          value={formData.weaknesses}
          onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
          placeholder={isArabic ? 'أدخل نقاط الضعف (سطر واحد لكل نقطة)' : 'Enter weaknesses (one per line)'}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          {isArabic ? 'أدخل كل نقطة ضعف في سطر منفصل' : 'Enter each weakness on a separate line'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">
          {isArabic ? 'ملاحظات' : 'Notes'}
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder={isArabic ? 'ملاحظات إضافية' : 'Additional notes'}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recommendation">
          {isArabic ? 'التوصية' : 'Recommendation'}
        </Label>
        <Textarea
          id="recommendation"
          value={formData.recommendation}
          onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
          placeholder={isArabic ? 'توصيات إضافية' : 'Additional recommendations'}
          rows={4}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'} animate-spin`} />
              {isArabic ? 'جاري الحفظ...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
              {isArabic ? 'حفظ النتيجة' : 'Save Result'}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          <X className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
          {isArabic ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </form>
  );
}

