import { Card } from '@/components/ui/card';
import type { Document } from '@shared/schema';

interface PdfViewerProps {
  document: Document;
  showSignatureAreas?: boolean;
  onSignatureAreaClick?: (area: { x: number; y: number }) => void;
}

export default function PdfViewer({ 
  document, 
  showSignatureAreas = false, 
  onSignatureAreaClick 
}: PdfViewerProps) {
  
  const handleSignatureAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSignatureAreaClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onSignatureAreaClick({ x, y });
  };

  return (
    <Card className="bg-white shadow-lg rounded-lg mx-auto p-8" style={{ width: "612px", minHeight: "792px" }}>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{document.title.toUpperCase()}</h1>
          <p className="text-gray-600">Document ID: {document.id.slice(0, 8)}</p>
        </div>
        
        <div className="space-y-6 text-sm text-gray-700">
          <p>This is a PDF document that has been uploaded to the document management system.</p>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Document Information:</h3>
              <p>Title: {document.title}</p>
              <p>Status: <span className="capitalize">{document.status}</span></p>
              <p>Original Filename: {document.originalFilename}</p>
              <p>File Size: {(document.fileSize / 1024).toFixed(1)} KB</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Timeline:</h3>
              <p>Created: {new Date(document.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(document.updatedAt).toLocaleDateString()}</p>
              {document.signedAt && (
                <p>Signed: {new Date(document.signedAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          
          {document.clientEmail && (
            <div>
              <h3 className="font-semibold mb-2">Client Information:</h3>
              <p>Email: {document.clientEmail}</p>
            </div>
          )}
          
          <div className="mt-16 space-y-8">
            <p className="text-center font-medium">Document content would be rendered here using a PDF viewer library.</p>
            
            {showSignatureAreas && (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 mb-4">Manager Signature:</p>
                  <div 
                    className="border-2 border-dashed border-primary/50 h-16 rounded-lg bg-primary/5 flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={handleSignatureAreaClick}
                    data-testid="signature-area-manager"
                  >
                    <span className="text-primary text-sm">Click to place signature</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Date: ___________</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-4">Client Signature:</p>
                  <div 
                    className="border-2 border-dashed border-secondary/50 h-16 rounded-lg bg-secondary/5 flex items-center justify-center cursor-pointer hover:bg-secondary/10 transition-colors"
                    onClick={handleSignatureAreaClick}
                    data-testid="signature-area-client"
                  >
                    <span className="text-secondary text-sm">Awaiting client signature</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Date: ___________</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
