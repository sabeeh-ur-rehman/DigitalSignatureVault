import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SignaturePad from "@/components/ui/signature-pad";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Document } from "@shared/schema";

export default function ClientSigning() {
  const [, params] = useRoute("/sign/:token");
  const token = params?.token;
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const { toast } = useToast();

  const { data: document, isLoading, error } = useQuery<Document>({
    queryKey: ["/api/documents/sign", token],
    enabled: !!token,
  });

  const signMutation = useMutation({
    mutationFn: async (data: { signatureData: string }) => {
      return apiRequest("POST", `/api/documents/sign/${token}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Document Signed Successfully",
        description: "The document has been signed and is now complete.",
      });
    },
    onError: () => {
      toast({
        title: "Signing Failed",
        description: "There was an error signing the document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSign = async () => {
    if (!signatureData) {
      toast({
        title: "Signature Required",
        description: "Please create your signature before signing the document.",
        variant: "destructive",
      });
      return;
    }

    if (!agreed) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions before signing.",
        variant: "destructive",
      });
      return;
    }

    signMutation.mutate({ signatureData });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-lg font-medium text-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-destructive mb-4"></i>
            <h1 className="text-2xl font-bold text-foreground mb-2">Document Not Found</h1>
            <p className="text-sm text-muted-foreground">
              The document link may have expired or is invalid.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (document.status === "signed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-check-circle text-4xl text-green-600 mb-4"></i>
            <h1 className="text-2xl font-bold text-foreground mb-2">Already Signed</h1>
            <p className="text-sm text-muted-foreground">
              This document has already been signed and completed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-card rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="page-title">
              Document Signature Required
            </h2>
            <p className="text-muted-foreground">Please review and sign the document below</p>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-foreground">
                <span className="font-medium">Document:</span> {document.title}
              </p>
              {document.clientEmail && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">For:</span> {document.clientEmail}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Document Viewer */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="bg-white shadow-lg rounded-lg mx-auto p-8" style={{ width: "612px", minHeight: "792px" }}>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{document.title.toUpperCase()}</h1>
                  <p className="text-gray-600">Document ID: {document.id.slice(0, 8)}</p>
                </div>
                
                <div className="space-y-6 text-sm text-gray-700">
                  <p>This document requires your digital signature to proceed.</p>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-2">Document Information:</h3>
                      <p>Title: {document.title}</p>
                      <p>Status: {document.status}</p>
                      <p>Created: {new Date(document.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Signing Information:</h3>
                      <p>Signing Date: {new Date().toLocaleDateString()}</p>
                      <p>Secure Token: {token?.slice(0, 8)}...</p>
                    </div>
                  </div>
                  
                  <div className="mt-16">
                    <p className="text-sm text-gray-600 mb-4">Your Signature: <span className="text-red-600">*Required</span></p>
                    <div className="border-2 border-dashed border-primary h-16 rounded-lg bg-primary/5 flex items-center justify-center">
                      {signatureData ? (
                        <img src={signatureData} alt="Your signature" className="max-h-12" data-testid="img-signature-preview" />
                      ) : (
                        <span className="text-primary text-sm font-medium">Signature will appear here</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signing Panel */}
            <div className="w-80 bg-muted p-6 border-l border-border">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-4">Create Your Signature</h3>
                  
                  <SignaturePad 
                    onSignatureChange={setSignatureData}
                    data-testid="signature-pad"
                  />
                  
                  <div className="flex items-start space-x-3 mt-6">
                    <Checkbox 
                      id="agreeTerms" 
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked as boolean)}
                      data-testid="checkbox-agree-terms"
                    />
                    <label htmlFor="agreeTerms" className="text-sm text-foreground">
                      I have read and agree to the terms and conditions outlined in this document.
                    </label>
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <Button 
                      className="w-full" 
                      onClick={handleSign}
                      disabled={!signatureData || !agreed || signMutation.isPending}
                      data-testid="button-sign-document"
                    >
                      {signMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Signing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-pen-fancy mr-2"></i>
                          Sign Document
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full" data-testid="button-download-pdf">
                      <i className="fas fa-download mr-2"></i>
                      Download PDF
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 bg-accent rounded-lg">
                  <div className="flex items-center mb-2">
                    <i className="fas fa-shield-alt text-green-600 mr-2"></i>
                    <span className="text-sm font-medium text-foreground">Secure Signing</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This document is protected with SSL encryption and will be legally binding upon signature.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
