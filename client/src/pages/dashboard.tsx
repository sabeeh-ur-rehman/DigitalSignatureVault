import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import FileUpload from "@/components/ui/file-upload";
import PdfEditor from "@/components/pdf-editor";
import TemplateLibrary from "@/components/template-library";
import { formatDistanceToNow } from "date-fns";
import type { Document, Template } from "@shared/schema";

interface DashboardStats {
  totalDocuments: number;
  pendingSignatures: number;
  completed: number;
  templatesUsed: number;
}

export default function Dashboard() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800" data-testid={`status-${status}`}>Pending</Badge>;
      case "signed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800" data-testid={`status-${status}`}>Signed</Badge>;
      case "draft":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800" data-testid={`status-${status}`}>Draft</Badge>;
      default:
        return <Badge variant="secondary" data-testid={`status-${status}`}>{status}</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onTemplatesClick={() => setShowTemplates(true)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="page-title">Dashboard</h2>
              <p className="text-sm text-muted-foreground">Manage your documents and signatures</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button data-testid="button-new-document">
                <i className="fas fa-plus mr-2"></i>
                New Document
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Documents</p>
                      <p className="text-3xl font-bold text-foreground" data-testid="stat-total-documents">
                        {stats?.totalDocuments || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-pdf text-primary text-xl"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Signatures</p>
                      <p className="text-3xl font-bold text-foreground" data-testid="stat-pending-signatures">
                        {stats?.pendingSignatures || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-clock text-yellow-600 text-xl"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-3xl font-bold text-foreground" data-testid="stat-completed">
                        {stats?.completed || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-check-circle text-green-600 text-xl"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Templates Used</p>
                      <p className="text-3xl font-bold text-foreground" data-testid="stat-templates-used">
                        {stats?.templatesUsed || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-layer-group text-secondary text-xl"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Upload Section */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Upload</h3>
                <FileUpload />
              </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Recent Documents</h3>
                  <Button variant="ghost" size="sm" data-testid="button-view-all">
                    View All
                  </Button>
                </div>
                
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-file-pdf text-4xl text-muted-foreground mb-4"></i>
                    <p className="text-lg font-medium text-foreground mb-2">No documents yet</p>
                    <p className="text-sm text-muted-foreground">Upload your first PDF to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.slice(0, 6).map((document) => (
                      <Card 
                        key={document.id} 
                        className="cursor-pointer hover:shadow-lg transition-all duration-200"
                        onClick={() => handleDocumentClick(document)}
                        data-testid={`card-document-${document.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <i className="fas fa-file-pdf text-red-600"></i>
                            </div>
                            {getStatusBadge(document.status)}
                          </div>
                          <h4 className="font-medium text-foreground mb-1" data-testid={`text-document-title-${document.id}`}>
                            {document.title}
                          </h4>
                          {document.clientEmail && (
                            <p className="text-sm text-muted-foreground mb-2" data-testid={`text-client-email-${document.id}`}>
                              Client: {document.clientEmail}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground" data-testid={`text-created-date-${document.id}`}>
                            Created {formatDistanceToNow(new Date(document.createdAt))} ago
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <Button variant="ghost" size="sm" data-testid={`button-view-${document.id}`}>
                              <i className="fas fa-eye mr-1"></i> View
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-share-${document.id}`}>
                              <i className="fas fa-share mr-1"></i> Share
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* PDF Editor Modal */}
      {selectedDocument && (
        <PdfEditor 
          document={selectedDocument} 
          onClose={() => setSelectedDocument(null)} 
        />
      )}

      {/* Template Library Modal */}
      {showTemplates && (
        <TemplateLibrary onClose={() => setShowTemplates(false)} />
      )}
    </div>
  );
}
