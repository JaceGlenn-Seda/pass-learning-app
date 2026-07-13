import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, ArrowLeft, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CertificateTemplate from '@/components/CertificateTemplate';
import { useToast } from '@/components/ui/use-toast';

export default function Certificate() {
  const { id } = useParams();
  const { toast } = useToast();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Certificate.get(id).then(setCert).finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    toast({ title: 'Generating PDF...', description: 'Your certificate is being prepared.' });
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    // Outer border
    doc.setDrawColor(27, 58, 140);
    doc.setLineWidth(3);
    doc.roundedRect(8, 8, w - 16, h - 16, 4, 4);

    // Gold inner frame
    doc.setDrawColor(245, 166, 35);
    doc.setLineWidth(0.8);
    doc.roundedRect(14, 14, w - 28, h - 28, 3, 3);

    // Logo text
    doc.setFontSize(22);
    doc.setTextColor(230, 57, 70);
    doc.text('●', w / 2 - 8, 32);
    doc.setTextColor(14, 31, 77);
    doc.setFont('helvetica', 'bold');
    doc.text('PASS', w / 2 - 4, 32);

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.text('CERTIFICATE OF COMPLETION', w / 2, 42, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('This certifies that', w / 2, 58, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(30);
    doc.setTextColor(14, 31, 77);
    doc.text(cert.learner_name, w / 2, 72, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('has successfully completed', w / 2, 84, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(27, 58, 140);
    doc.text(cert.course_title, w / 2, 96, { align: 'center' });

    // Seal
    doc.setDrawColor(245, 166, 35);
    doc.setLineWidth(1);
    doc.circle(w / 2, 116, 12);
    doc.circle(w / 2, 116, 10);
    doc.setFontSize(14);
    doc.setTextColor(245, 166, 35);
    doc.setFont('helvetica', 'bold');
    doc.text(cert.score + '%', w / 2, 115, { align: 'center' });
    doc.setFontSize(6);
    doc.setTextColor(120, 120, 120);
    doc.text('SCORE', w / 2, 121, { align: 'center' });

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(22, h - 24, 80, h - 24);
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(14, 31, 77);
    doc.text('Parikshit Trivedi', 22, h - 26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('CEO, PASS', 22, h - 22);

    doc.setFontSize(7);
    doc.text('DATE ISSUED', w / 2, h - 26, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(14, 31, 77);
    const date = cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    doc.text(date, w / 2, h - 22, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('CERTIFICATE ID', w - 22, h - 26, { align: 'right' });
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(14, 31, 77);
    doc.text(cert.certificate_id, w - 22, h - 22, { align: 'right' });

    doc.save(`${cert.certificate_id}.pdf`);
    toast({ title: 'Certificate downloaded!', description: 'Check your downloads folder.' });
  };

  const handleShare = async () => {
    const text = `I just completed "${cert.course_title}" on PASS Learning App with a score of ${cert.score}%! 🎉 Certificate ID: ${cert.certificate_id}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'My PASS Certificate', text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied to clipboard!', description: 'Share your achievement with your network.' });
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;
  if (!cert) return <div className="p-8 text-center text-muted-foreground">Certificate not found.</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <Link to="/certificates" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-secondary">
        <ArrowLeft size={16} /> All certificates
      </Link>

      <CertificateTemplate certificate={cert} />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button onClick={handleDownload} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
          <Download size={16} /> Download PDF
        </button>
        <button onClick={handleShare} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-bold text-secondary hover:bg-muted">
          <Share2 size={16} /> Share
        </button>
      </div>
    </div>
  );
}