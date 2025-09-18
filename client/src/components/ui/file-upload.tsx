import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function FileUpload() {
  const [title, setTitle] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document Uploaded",
        description: "Your PDF has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setTitle('');
      setClientEmail('');
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('title', title || file.name);
      formData.append('clientEmail', clientEmail);
      
      uploadMutation.mutate(formData);
    }
  }, [title, clientEmail, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Document Title (Optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            data-testid="input-document-title"
          />
        </div>
        <div>
          <Label htmlFor="clientEmail">Client Email (Optional)</Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@example.com"
            data-testid="input-client-email"
          />
        </div>
      </div>

      <Card>
        <CardContent 
          {...getRootProps()} 
          className={`p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-dashed border-2 border-border hover:border-primary hover:bg-primary/5'
          }`}
          data-testid="dropzone-upload"
        >
          <input {...getInputProps()} />
          
          {uploadMutation.isPending ? (
            <div>
              <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
              <p className="text-lg font-medium text-foreground mb-2">Uploading...</p>
              <p className="text-sm text-muted-foreground">Please wait while we process your file</p>
            </div>
          ) : (
            <div>
              <i className="fas fa-cloud-upload-alt text-4xl text-muted-foreground mb-4"></i>
              <p className="text-lg font-medium text-foreground mb-2">
                {isDragActive ? 'Drop your PDF file here' : 'Drag and drop your PDF files here'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or <Button variant="link" className="p-0 h-auto">browse files</Button>
              </p>
              <p className="text-xs text-muted-foreground">Supports: PDF files up to 10MB</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
