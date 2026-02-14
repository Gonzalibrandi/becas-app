import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { getFundingInfo, getEducationInfo } from "@/lib/utils/constants";
import { getDeadlineStatus, getDeadlineStyle } from "@/lib/utils/deadline";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  ExternalLink,
  CheckCircle,
  BookOpen,
  Target,
  GraduationCap
} from "lucide-react";
import FavoriteButton from "../../_components/FavoriteButton";
import ShareButton from "./ShareButton";
import type { Metadata } from "next";

// Force dynamic rendering - page fetches from database
export const dynamic = 'force-dynamic';

// SEO: Dynamic metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const beca = await getScholarship(slug);

  if (!beca) {
    return { title: "Beca no encontrada | Becas App" };
  }

  return {
    title: `${beca.title} | Becas App`,
    description: beca.description?.slice(0, 160) || `Información sobre ${beca.title}`,
    openGraph: {
      title: beca.title,
      description: beca.description?.slice(0, 160) || `Beca en ${(beca.countries?.map(c => c.name).join(", ")) || beca.country || "el mundo"}`,
      type: "article",
    },
  };
}

// Fetch scholarship directly from Prisma by slug
async function getScholarship(slug: string) {
  try {
    return await prisma.scholarship.findUnique({
      where: { slug },
      include: {
        categories: { select: { name: true, slug: true } },
        countries: { select: { name: true } },
      },
    });
  } catch (error) {
    console.error("Error fetching scholarship:", error);
    return null;
  }
}

export default async function ScholarshipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const beca = await getScholarship(slug);

  if (!beca) {
    notFound();
  }

  const funding = getFundingInfo(beca.fundingType);
  const education = getEducationInfo(beca.educationLevel);
  const deadlineStatus = getDeadlineStatus(beca.deadline);
  const deadline = beca.deadline ? new Date(beca.deadline) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Hero Header with Gradient */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white rounded-full" />
          <div className="absolute -left-20 bottom-0 w-60 h-60 bg-white rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          {/* Back button */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-emerald-100 hover:text-white transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Volver a becas
          </Link>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
            {beca.title}
          </h1>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              <MapPin size={14} />
              <MapPin size={14} />
              {(beca.countries && beca.countries.length > 0) ? beca.countries.map(c => c.name).join(", ") : (beca.country || "Internacional")}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              {funding.icon} {funding.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              {education.icon} {education.label}
            </span>
            {deadlineStatus.label && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${getDeadlineStyle(deadlineStatus.color)}`}>
                {deadlineStatus.urgent && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                  </span>
                )}
                {deadlineStatus.label}
              </span>
            )}
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                <BookOpen size={22} className="text-emerald-600" />
                Descripción
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {beca.description || "No hay descripción disponible para esta beca."}
              </p>
            </div>

            {/* Benefits Card */}
            {beca.benefits && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <CheckCircle size={22} className="text-emerald-600" />
                  Beneficios
                </h2>
                <ul className="space-y-3">
                  {beca.benefits.split('\n').filter(line => line.trim()).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-600">
                      <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle size={12} className="text-emerald-600" />
                      </span>
                      <span>{benefit.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements Card */}
            {beca.requirements && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Target size={22} className="text-emerald-600" />
                  Requisitos
                </h2>
                <ul className="space-y-3">
                  {beca.requirements.split('\n').filter(line => line.trim()).map((req, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-600">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      </span>
                      <span>{req.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Categories Card (replaces old Areas) */}
            {beca.categories && beca.categories.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <GraduationCap size={22} className="text-emerald-600" />
                  Categorías
                </h2>
                <div className="flex flex-wrap gap-2">
                  {beca.categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/?category=${cat.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100 hover:bg-purple-100 hover:border-purple-200 transition-colors"
                    >
                      <BookOpen size={14} />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* CTA Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              
              {/* Deadline */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                  <Calendar size={14} />
                  Fecha límite
                </p>
                <p className={`text-2xl font-bold ${deadlineStatus.expired ? 'text-red-600' : 'text-gray-900'}`}>
                  {deadline 
                    ? deadline.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Sin fecha especificada'
                  }
                </p>
                {deadlineStatus.label && (
                  <span className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-lg text-xs font-semibold border ${getDeadlineStyle(deadlineStatus.color)}`}>
                    {deadlineStatus.urgent && "⚡ "}{deadlineStatus.label}
                  </span>
                )}
              </div>

              {/* Duration */}
              {beca.duration && (
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <p className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                    <Clock size={14} />
                    Duración
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {beca.duration}
                  </p>
                </div>
              )}

              {/* Apply Button */}
              {beca.applyUrl && (
                <a 
                  href={beca.applyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
                >
                  Aplicar Ahora
                  <ExternalLink size={20} />
                </a>
              )}

              {/* Official URL */}
              {beca.officialUrl && (
                <a 
                  href={beca.officialUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 mt-3 border-2 border-gray-200 hover:border-emerald-500 text-gray-700 hover:text-emerald-600 px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Sitio Oficial
                  <ExternalLink size={16} />
                </a>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <FavoriteButton scholarshipId={beca.id} />
                <ShareButton title={beca.title} />
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Información Rápida</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm">🌍</span>
                  <div>
                    <p className="text-gray-500 text-xs">País</p>
                    <p className="font-medium">{(beca.countries && beca.countries.length > 0) ? beca.countries.map(c => c.name).join(", ") : (beca.country || "Internacional")}</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm">{funding.icon}</span>
                  <div>
                    <p className="text-gray-500 text-xs">Financiamiento</p>
                    <p className="font-medium">{funding.label}</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm">{education.icon}</span>
                  <div>
                    <p className="text-gray-500 text-xs">Nivel Educativo</p>
                    <p className="font-medium">{education.label}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}