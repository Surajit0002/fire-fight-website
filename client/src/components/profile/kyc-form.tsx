import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  FileText,
  CreditCard,
  User
} from "lucide-react";

const kycSchema = z.object({
  documentType: z.enum(['aadhaar', 'pan', 'passport', 'driving_license']),
  documentNumber: z.string().min(1, "Document number is required"),
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
});

type KYCForm = z.infer<typeof kycSchema>;

interface KYCFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KYCForm({ isOpen, onClose }: KYCFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'form' | 'documents' | 'submit' | 'success'>('form');
  const [frontDocument, setFrontDocument] = useState<File | null>(null);
  const [backDocument, setBackDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<KYCForm>({
    resolver: zodResolver(kycSchema),
  });

  const documentType = watch('documentType');

  const submitKYCMutation = useMutation({
    mutationFn: async (data: KYCForm) => {
      // In a real app, this would upload files and submit KYC data
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      if (frontDocument) formData.append('frontDocument', frontDocument);
      if (backDocument) formData.append('backDocument', backDocument);
      if (selfie) formData.append('selfie', selfie);

      return await apiRequest("POST", "/api/profile/kyc", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setStep('success');
      toast({
        title: "KYC Submitted!",
        description: "Your verification documents have been submitted for review.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (type: 'front' | 'back' | 'selfie', file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    switch (type) {
      case 'front':
        setFrontDocument(file);
        break;
      case 'back':
        setBackDocument(file);
        break;
      case 'selfie':
        setSelfie(file);
        break;
    }
  };

  const onSubmit = (data: KYCForm) => {
    if (step === 'form') {
      setStep('documents');
    } else if (step === 'documents') {
      if (!frontDocument || !selfie) {
        toast({
          title: "Missing Documents",
          description: "Please upload all required documents",
          variant: "destructive",
        });
        return;
      }
      setStep('submit');
    }
  };

  const handleFinalSubmit = () => {
    const formData = watch();
    submitKYCMutation.mutate(formData);
  };

  const resetForm = () => {
    setStep('form');
    setFrontDocument(null);
    setBackDocument(null);
    setSelfie(null);
    reset();
  };

  const getDocumentRequirements = (type: string) => {
    switch (type) {
      case 'aadhaar':
        return {
          front: 'Front side of Aadhaar Card',
          back: 'Back side of Aadhaar Card',
          needsBack: true
        };
      case 'pan':
        return {
          front: 'PAN Card',
          back: null,
          needsBack: false
        };
      case 'passport':
        return {
          front: 'Passport first page',
          back: 'Passport address page',
          needsBack: true
        };
      case 'driving_license':
        return {
          front: 'Front side of Driving License',
          back: 'Back side of Driving License',
          needsBack: true
        };
      default:
        return {
          front: 'Document front',
          back: 'Document back',
          needsBack: false
        };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="max-w-2xl" data-testid="kyc-form-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shield className="w-6 h-6" />
            KYC Verification
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <div className="text-sm">
                <div className="font-medium">Why KYC is required</div>
                <div className="text-muted-foreground">
                  Identity verification is mandatory for withdrawals as per Indian regulations.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="documentType">Document Type *</Label>
                <select 
                  {...register('documentType')} 
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  data-testid="document-type-select"
                >
                  <option value="">Select Document Type</option>
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                </select>
                {errors.documentType && (
                  <p className="text-sm text-destructive mt-1">{errors.documentType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="documentNumber">Document Number *</Label>
                <Input
                  id="documentNumber"
                  {...register('documentNumber')}
                  placeholder="Enter document number"
                  data-testid="document-number-input"
                />
                {errors.documentNumber && (
                  <p className="text-sm text-destructive mt-1">{errors.documentNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="fullName">Full Name (as per document) *</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Enter your full name"
                  data-testid="full-name-input"
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  data-testid="date-of-birth-input"
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-destructive mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Enter your complete address"
                  data-testid="address-input"
                />
                {errors.address && (
                  <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} data-testid="cancel-kyc">
                Cancel
              </Button>
              <Button 
                type="submit"
                className="gradient-fire text-black font-bold"
                disabled={!documentType}
                data-testid="next-step"
              >
                Next: Upload Documents
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'documents' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
              <p className="text-sm text-muted-foreground">
                Please upload clear photos of your {documentType?.replace('_', ' ')} and a selfie
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front Document */}
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <h4 className="font-medium mb-2">
                      {getDocumentRequirements(documentType || '').front}
                    </h4>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('front', e.target.files?.[0] || null)}
                      className="hidden"
                      id="front-document"
                    />
                    <Label 
                      htmlFor="front-document" 
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
                      data-testid="upload-front-document"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Label>
                    {frontDocument && (
                      <div className="mt-2">
                        <Badge className="bg-green-500/20 text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Uploaded
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Back Document (if needed) */}
              {getDocumentRequirements(documentType || '').needsBack && (
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <h4 className="font-medium mb-2">
                        {getDocumentRequirements(documentType || '').back}
                      </h4>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('back', e.target.files?.[0] || null)}
                        className="hidden"
                        id="back-document"
                      />
                      <Label 
                        htmlFor="back-document" 
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
                        data-testid="upload-back-document"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </Label>
                      {backDocument && (
                        <div className="mt-2">
                          <Badge className="bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Uploaded
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Selfie */}
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="text-center">
                    <User className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <h4 className="font-medium mb-2">Selfie with Document</h4>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('selfie', e.target.files?.[0] || null)}
                      className="hidden"
                      id="selfie"
                    />
                    <Label 
                      htmlFor="selfie" 
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
                      data-testid="upload-selfie"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Label>
                    {selfie && (
                      <div className="mt-2">
                        <Badge className="bg-green-500/20 text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Uploaded
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Document Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Images should be clear and well-lit</li>
                <li>• All text should be clearly readable</li>
                <li>• File size should not exceed 5MB</li>
                <li>• Supported formats: JPG, PNG, PDF</li>
                <li>• Hold your document while taking the selfie</li>
              </ul>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep('form')} data-testid="back-to-form">
                Back
              </Button>
              <Button 
                className="gradient-fire text-black font-bold"
                onClick={() => setStep('submit')}
                disabled={!frontDocument || !selfie || (getDocumentRequirements(documentType || '').needsBack && !backDocument)}
                data-testid="review-submit"
              >
                Review & Submit
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'submit' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Review Your Information</h3>
              <p className="text-sm text-muted-foreground">
                Please review all information before submitting
              </p>
            </div>

            <Card className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document Type:</span>
                  <span className="font-medium">{watch('documentType')?.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document Number:</span>
                  <span className="font-medium">{watch('documentNumber')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="font-medium">{watch('fullName')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="font-medium">{watch('dateOfBirth')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Documents:</span>
                  <div className="text-right">
                    {frontDocument && <div className="text-green-500 text-sm">✓ Front document</div>}
                    {backDocument && <div className="text-green-500 text-sm">✓ Back document</div>}
                    {selfie && <div className="text-green-500 text-sm">✓ Selfie</div>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Important</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Once submitted, your documents will be reviewed within 24-48 hours. 
                You cannot modify the information after submission.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep('documents')} data-testid="back-to-documents">
                Back
              </Button>
              <Button 
                className="gradient-fire text-black font-bold"
                onClick={handleFinalSubmit}
                disabled={submitKYCMutation.isPending}
                data-testid="submit-kyc"
              >
                {submitKYCMutation.isPending ? "Submitting..." : "Submit KYC"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 gradient-fire rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-black" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">KYC Submitted Successfully!</h3>
              <p className="text-muted-foreground">
                Your documents have been submitted for verification. 
                You will receive an update within 24-48 hours.
              </p>
            </div>

            <Badge className="bg-yellow-500/20 text-yellow-400">
              Under Review
            </Badge>

            <Button 
              className="gradient-fire text-black font-bold"
              onClick={() => {
                onClose();
                resetForm();
              }}
              data-testid="close-kyc-success"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
