"use client";

import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Star } from "lucide-react";
import { getFundingInfo } from "@/lib/utils/constants";
import { getDeadlineStatus, getDeadlineStyle } from "@/lib/utils/deadline";
import FavoriteButton from "./FavoriteButton";

type ScholarshipCardProps = {
  scholarship: {
    id: string;
    title: string;
    slug: string;
    countries?: { name: string }[];
    deadline: Date | null;
    fundingType: string;
    description: string | null;
    isRecommended?: boolean;
  };
};

export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const funding = getFundingInfo(scholarship.fundingType);
  const deadlineStatus = getDeadlineStatus(scholarship.deadline);

  return (
    <>
      <Link 
        href={`/scholarship/${scholarship.slug}`} 
        className={`group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border overflow-hidden relative ${scholarship.isRecommended ? 'border-yellow-200 ring-1 ring-yellow-100' : 'border-gray-100'}`}
      >
        {/* Favorite Button */}
        <div className="absolute top-4 right-4 z-10">
          <FavoriteButton scholarshipId={scholarship.id} variant="card" />
        </div>

        {/* Card Top */}
        <div className={`h-2 bg-gradient-to-r ${scholarship.isRecommended ? 'from-yellow-400 to-amber-500' : 'from-emerald-500 to-teal-500'}`} />
        
        {/* Card Content */}
        <div className="p-5 sm:p-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3 pr-10">
            {scholarship.isRecommended && (
              <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-yellow-200 flex items-center gap-1">
                <Star size={12} fill="currentColor" /> Recomendada
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${funding.style}`}>
              {funding.label}
            </span>
            {deadlineStatus.label && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getDeadlineStyle(deadlineStatus.color)}`}>
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

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors mb-3 pr-8">
            {scholarship.title}
          </h2>
          
          {/* Description preview */}
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            {scholarship.description || "Ver más detalles sobre esta beca..."}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400" />
              {scholarship.countries && scholarship.countries.length > 0 
                ? scholarship.countries.map(c => c.name).join(", ")
                : "Internacional"
              }
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              {scholarship.deadline 
                ? new Date(scholarship.deadline).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                : 'Sin fecha'
              }
            </span>
          </div>

          {/* CTA */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1">
              Ver detalles
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </>
  );
}
