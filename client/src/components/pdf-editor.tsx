import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import PdfViewer from './pdf-viewer';
import SignaturePad from './ui/signature-pad';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import type { Document } from '@shared/schema';

interface PdfEditorProps {
  document: Document;
  onClose: () => void;
}

export default function PdfEditor({ document, onClose }: PdfEditorProps) {
  const [clientEmail, setClientEmail] = useState(document.clientEmail || '');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const { toast } = useToast();

  const generateLinkMutation = useMutation({
    mutationFn: async (data: { clientEmail: string }) => {
      const response = await apiRequest('POST', `/api/documents/${document.id}/generate-link`, data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedLink(data.signingUrl);
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Secure Link Generated",
        description: "The signing link has been created and can be shared with the client.",
      });
    },
    onError: () => {
      toast({
        title: "Link Generation Failed",
        description: "There was an error generating the signing link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateLink = () => {
    if (!clientEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter the client's email address.",
        variant: "destructive",
      });
      return;
    }

    generateLinkMutation.mutate({ clientEmail });
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Link Copied",
        description: "The signing link has been copied to your clipboard.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "signed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Signed</Badge>;
      case "draft":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-card rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center">
              <h3 className="text-xl font-semibold text-foreground mr-4">PDF Editor</h3>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {document.title}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="secondary" data-testid="button-save">
                <i className="fas fa-save mr-2"></i>
                Save
              </Button>
              <Button 
                onClick={handleGenerateLink}
                disabled={generateLinkMutation.isPending}
                data-testid="button-generate-link"
              >
                <i className="fas fa-share mr-2"></i>
                Generate Link
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-editor">
                <i className="fas fa-times"></i>
              </Button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Toolbar */}
            <div className="w-64 bg-muted p-4 border-r border-border overflow-y-auto">
              <div className="space-y-6">
                {/* Signature Tools */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Signature Tools</h4>
                  <div className="space-y-3">
                    <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-create-signature">
                      <i className="fas fa-signature mr-2 text-primary"></i>
                      Create Signature
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-text-signature">
                      <i className="fas fa-pen mr-2 text-secondary"></i>
                      Text Signature
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-add-date">
                      <i className="fas fa-calendar mr-2 text-green-600"></i>
                      Add Date
                    </Button>
                  </div>
                </div>

                {/* Text Tools */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Text Tools</h4>
                  <div className="space-y-3">
                    <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-add-text">
                      <i className="fas fa-font mr-2 text-orange-600"></i>
                      Add Text
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-highlight">
                      <i className="fas fa-highlight mr-2 text-yellow-600"></i>
                      Highlight
                    </Button>
                  </div>
                </div>

                {/* Create New Signature */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Create Signature</h4>
                  <SignaturePad 
                    onSignatureChange={(signature) => console.log('Signature created:', signature)}
                    data-testid="signature-pad-editor"
                  />
                </div>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 p-4 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
              <PdfViewer 
                document={document} 
                showSignatureAreas={true}
                onSignatureAreaClick={(area) => console.log('Signature area clicked:', area)}
              />
            </div>

            {/* Right Panel */}
            <div className="w-80 bg-muted p-4 border-l border-border overflow-y-auto">
              <div className="space-y-6">
                {/* Document Info */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Document Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(document.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="text-foreground">{(document.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="text-foreground">
                        {formatDistanceToNow(new Date(document.createdAt))} ago
                      </span>
                    </div>
                    {document.signedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Signed:</span>
                        <span className="text-foreground">
                          {formatDistanceToNow(new Date(document.signedAt))} ago
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Generate Secure Link */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Secure Sharing</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="clientEmail">Client email:</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="client@example.com"
                        data-testid="input-client-email-editor"
                      />
                    </div>
                    
                    {generatedLink && (
                      <Card>
                        <CardContent className="p-3">
                          <p className="text-xs text-muted-foreground mb-2">Secure signing link:</p>
                          <div className="flex items-center space-x-2">
                            <Input
                              value={generatedLink}
                              readOnly
                              className="text-xs"
                              data-testid="input-generated-link"
                            />
                            <Button size="sm" onClick={copyToClipboard} data-testid="button-copy-link">
                              <i className="fas fa-copy"></i>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-foreground">Document uploaded</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(document.createdAt))} ago
                        </p>
                      </div>
                    </div>
                    {document.status === 'pending' && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-foreground">Signing link generated</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(document.updatedAt))} ago
                          </p>
                        </div>
                      </div>
                    )}
                    {document.signedAt && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-foreground">Document signed</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(document.signedAt))} ago
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
