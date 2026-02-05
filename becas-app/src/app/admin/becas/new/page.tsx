import AdminLayout from "@/components/admin/AdminLayout";
import ScholarshipForm from "@/components/admin/ScholarshipForm";
import { Sparkles } from "lucide-react";

export default function NewScholarshipPage() {
  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header - Same style as Dashboard */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Beca</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Agregá una beca manualmente o con ayuda de la IA
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-4 py-2 rounded-xl">
            <Sparkles size={18} />
            <span className="text-sm font-medium">IA Disponible</span>
          </div>
        </div>

        {/* Form Component */}
        <ScholarshipForm />
      </div>
    </AdminLayout>
  );
}
