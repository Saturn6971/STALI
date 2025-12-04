'use client';

import { CategoryCardProps } from '@/types';

export default function CategoryCard({ 
  id, 
  title, 
  description, 
  icon, 
  gradient, 
  hoverGradient, 
  href = '#' 
}: CategoryCardProps) {
  return (
    <a
      href={href}
      className="relative p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all duration-300 cursor-pointer group hover:scale-102"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-400 mb-6">{description}</p>
        <div className="w-full bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-center">
          Browse {title}
        </div>
      </div>
    </a>
  );
}

