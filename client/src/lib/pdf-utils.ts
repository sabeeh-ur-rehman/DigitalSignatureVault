// Utility functions for PDF handling and manipulation

export interface SignaturePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface SignatureData {
  imageData: string; // Base64 encoded signature image
  position: SignaturePosition;
  timestamp: Date;
  signerInfo?: {
    name: string;
    email: string;
  };
}

export const validatePDFFile = (file: File): boolean => {
  return file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024; // 10MB limit
};

export const generateSecureToken = (): string => {
  return crypto.randomUUID();
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const createSignatureFromCanvas = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL('image/png');
};

export const createTextSignature = (text: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 100;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.font = '24px cursive';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  return canvas.toDataURL('image/png');
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateSigningUrl = (baseUrl: string, token: string): string => {
  return `${baseUrl}/sign/${token}`;
};

export const getDocumentStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'blue';
    case 'pending':
      return 'yellow';
    case 'signed':
      return 'green';
    case 'expired':
      return 'red';
    default:
      return 'gray';
  }
};

export const calculateSignaturePosition = (
  clickEvent: React.MouseEvent,
  containerElement: HTMLElement
): SignaturePosition => {
  const rect = containerElement.getBoundingClientRect();
  const x = clickEvent.clientX - rect.left;
  const y = clickEvent.clientY - rect.top;
  
  return {
    x,
    y,
    width: 150, // Default signature width
    height: 60,  // Default signature height
    page: 1,     // Default to first page
  };
};
