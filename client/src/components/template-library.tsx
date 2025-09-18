import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Template } from '@shared/schema';

interface TemplateLibraryProps {
  onClose: () => void;
}

const categories = [
  { id: 'contracts', name: 'Contracts', icon: 'fas fa-file-contract' },
  { id: 'invoices', name: 'Invoices', icon: 'fas fa-file-invoice' },
  { id: 'proposals', name: 'Proposals', icon: 'fas fa-handshake' },
  { id: 'ndas', name: 'NDAs', icon: 'fas fa-user-secret' },
  { id: 'receipts', name: 'Receipts', icon: 'fas fa-receipt' },
  { id: 'other', name: 'Other', icon: 'fas fa-ellipsis-h' },
];

export default function TemplateLibrary({ onClose }: TemplateLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('contracts');
  const [title, setTitle] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const { toast } = useToast();

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ['/api/templates', selectedCategory],
  });

  const useTemplateMutation = useMutation({
    mutationFn: async ({ templateId, data }: { templateId: string; data: { title: string; clientEmail: string } }) => {
      const response = await apiRequest('POST', `/api/templates/${templateId}/use`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Template Used",
        description: "A new document has been created from the template.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Template Error",
        description: "There was an error using the template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUseTemplate = (template: Template) => {
    const documentTitle = title || template.title;
    useTemplateMutation.mutate({
      templateId: template.id,
      data: { title: documentTitle, clientEmail },
    });
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon || 'fas fa-file';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-card rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground" data-testid="page-title">Template Library</h2>
                <p className="text-muted-foreground">Choose from our collection of professional document templates</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-templates">
                <i className="fas fa-times"></i>
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Category Sidebar */}
            <div className="w-64 bg-muted p-4 border-r border-border">
              <h3 className="font-medium text-foreground mb-4">Categories</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Button
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                      data-testid={`button-category-${category.id}`}
                    >
                      <i className={`${category.icon} mr-2`}></i>
                      {category.name}
                    </Button>
                  </li>
                ))}
              </ul>

              {/* Template Options */}
              <div className="mt-8 space-y-4">
                <div>
                  <Label htmlFor="templateTitle">Document Title (Optional)</Label>
                  <Input
                    id="templateTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Custom document title"
                    data-testid="input-template-title"
                  />
                </div>
                <div>
                  <Label htmlFor="templateClientEmail">Client Email (Optional)</Label>
                  <Input
                    id="templateClientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    data-testid="input-template-client-email"
                  />
                </div>
              </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 p-6 overflow-auto">
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-file-alt text-4xl text-muted-foreground mb-4"></i>
                  <p className="text-lg font-medium text-foreground mb-2">No templates available</p>
                  <p className="text-sm text-muted-foreground">
                    No templates found in this category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <Card 
                      key={template.id} 
                      className="overflow-hidden hover:shadow-lg transition-all duration-200"
                      data-testid={`card-template-${template.id}`}
                    >
                      {/* Template Preview */}
                      <div className="h-48 bg-white p-4 relative overflow-hidden">
                        <div className="text-xs text-gray-800">
                          <div className="text-center font-bold mb-2 uppercase">
                            {template.title}
                          </div>
                          <div className="space-y-1">
                            <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-1 bg-gray-300 rounded w-full"></div>
                            <div className="h-1 bg-gray-300 rounded w-1/2"></div>
                            <div className="mt-2 space-y-1">
                              <div className="h-1 bg-gray-200 rounded w-2/3"></div>
                              <div className="h-1 bg-gray-200 rounded w-full"></div>
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 left-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="h-3 border border-dashed border-gray-400 rounded"></div>
                              <div className="h-3 border border-dashed border-gray-400 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-foreground" data-testid={`text-template-title-${template.id}`}>
                            {template.title}
                          </h3>
                          <i className={`${getCategoryIcon(template.category)} text-muted-foreground`}></i>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3" data-testid={`text-template-description-${template.id}`}>
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">PDF Template</Badge>
                          <Button 
                            size="sm" 
                            onClick={() => handleUseTemplate(template)}
                            disabled={useTemplateMutation.isPending}
                            data-testid={`button-use-template-${template.id}`}
                          >
                            {useTemplateMutation.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-1"></i>
                                Using...
                              </>
                            ) : (
                              "Use Template"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
