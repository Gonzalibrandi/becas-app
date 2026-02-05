import AdminLayout from "@/components/admin/AdminLayout";
import ScholarshipForm from "@/components/admin/ScholarshipForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getScholarship(id: string) {
  const scholarship = await prisma.scholarship.findUnique({
    where: { id },
  });
  
  if (!scholarship) return null;
  
  // Convert dates to strings for the form
  return {
    ...scholarship,
    deadline: scholarship.deadline?.toISOString() || null,
    startDate: scholarship.startDate?.toISOString() || null,
  };
}

export default async function EditScholarshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scholarship = await getScholarship(id);
  
  if (!scholarship) {
    notFound();
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Editar Beca</h1>
          <p className="text-slate-600 mt-1">{scholarship.title}</p>
        </div>
        
        <ScholarshipForm initialData={scholarship} isEditing={true} />
      </div>
    </AdminLayout>
  );
}
