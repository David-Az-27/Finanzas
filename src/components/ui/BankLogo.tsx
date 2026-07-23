import React from 'react';

interface BankLogoProps {
  bankName: string;
  className?: string;
}

export function BankLogo({ bankName, className = '' }: BankLogoProps) {
  const name = bankName.toLowerCase();

  if (name.includes('nu') || name.includes('nubank')) {
    // Logo Nu: Letras estilizadas "nu" redondeadas
    return (
      <div className={`flex items-center ${className}`}>
        <svg viewBox="0 0 100 40" className="h-6 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M15,20 C15,12 22,8 30,8 C38,8 42,12 42,20 L42,32 L32,32 L32,20 C32,16 30,15 28,15 C26,15 25,16 25,20 L25,32 L15,32 L15,20 Z" />
          <path d="M50,8 L60,8 L60,20 C60,24 62,25 64,25 C66,25 68,24 68,20 L68,8 L78,8 L78,20 C78,28 71,32 63,32 C55,32 50,28 50,20 L50,8 Z" />
        </svg>
      </div>
    );
  }

  if (name.includes('bancolombia') || name === 'bc') {
    // Logo Bancolombia: Las tres franjas (amarillo, azul, rojo) o simplemente blancas en modo oscuro, junto al texto
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-auto" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="4" height="20" rx="1" fill="currentColor" opacity="1" />
          <rect x="10" y="2" width="4" height="20" rx="1" fill="currentColor" opacity="0.7" />
          <rect x="18" y="2" width="4" height="20" rx="1" fill="currentColor" opacity="0.4" />
        </svg>
        <span className="font-bold tracking-tight text-sm">Bancolombia</span>
      </div>
    );
  }

  if (name.includes('bogota') || name.includes('bogotá')) {
    // Logo Banco de Bogotá: Una "B" estilizada
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div className="flex h-5 w-5 items-center justify-center rounded-sm border-2 border-current font-bold text-[10px]">
          B
        </div>
        <span className="font-bold tracking-tight text-sm">Banco de Bogotá</span>
      </div>
    );
  }

  if (name.includes('villas')) {
    // Logo AV Villas
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M12,2 L2,22 L10,22 L15,12 L20,22 L24,22 Z" />
        </svg>
        <span className="font-bold tracking-tight text-sm">AV Villas</span>
      </div>
    );
  }

  // Fallback genérico para otros bancos o tarjetas
  return (
    <span className={`font-bold italic tracking-wider text-sm uppercase ${className}`}>
      {bankName}
    </span>
  );
}
