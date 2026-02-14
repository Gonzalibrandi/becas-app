import { HelpCircle, MessageCircle, Mail, BookOpen } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const helpItems = [
    {
      icon: BookOpen,
      title: "¿Cómo funciona?",
      description: "Explorá becas, filtrá por país o tipo, y aplicá directamente.",
    },
    {
      icon: MessageCircle,
      title: "¿Cómo guardar becas?",
      description: "Hacé clic en el corazón para guardar becas y verlas después.",
    },
    {
      icon: Mail,
      title: "Contacto",
      description: `¿Tenés dudas? Escribinos a librandigonzalo@gmail.com`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Centro de Ayuda</h1>
        <p className="text-gray-500 mt-1">Encontrá respuestas a tus preguntas</p>
      </div>

      {/* Help Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {helpItems.map((item) => (
          <div 
            key={item.title}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
              <item.icon className="text-emerald-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Back to explore */}
      <div className="text-center pt-4">
        <Link 
          href="/"
          className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2"
        >
          ← Volver a explorar becas
        </Link>
      </div>
    </div>
  );
}
