
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Link, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface URLParameterHelperProps {
  strainName: string;
}

const URLParameterHelper: React.FC<URLParameterHelperProps> = ({ strainName }) => {
  const { toast } = useToast();
  const baseUrl = window.location.origin;
  
  const exampleUrls = [
    {
      title: "Basic Generation",
      url: `${baseUrl}/strain/${strainName}`,
      description: "Generate strain with AI defaults"
    },
    {
      title: "With Type & Potency",
      url: `${baseUrl}/strain/${strainName}?type=indica&thc=25&cbd=2`,
      description: "Specify strain type and cannabinoid levels"
    },
    {
      title: "With Effects & Flavors",
      url: `${baseUrl}/strain/${strainName}?effects=relaxed,sleepy&flavors=berry,earthy`,
      description: "Define specific effects and flavor profiles"
    },
    {
      title: "Full Custom Profile",
      url: `${baseUrl}/strain/${strainName}?type=hybrid&thc=22&cbd=3&effects=creative,uplifting&flavors=citrus,pine&description=Perfect for daytime creativity`,
      description: "Complete custom strain specification"
    }
  ];

  const parameters = [
    { name: 'type', values: 'indica | sativa | hybrid', description: 'Strain classification' },
    { name: 'thc', values: '0-35', description: 'THC percentage' },
    { name: 'cbd', values: '0-25', description: 'CBD percentage' },
    { name: 'effects', values: 'comma-separated', description: 'Desired effects (e.g., relaxed,happy)' },
    { name: 'flavors', values: 'comma-separated', description: 'Flavor profile (e.g., citrus,pine)' },
    { name: 'description', values: 'text', description: 'Custom characteristics description' },
    { name: 'force', values: 'true | false', description: 'Force regeneration if strain exists' }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            URL Parameters
          </CardTitle>
          <CardDescription>
            Use URL parameters to customize strain generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {parameters.map((param) => (
              <div key={param.name} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="font-mono w-fit">
                  {param.name}
                </Badge>
                <span className="text-sm text-muted-foreground flex-1">
                  {param.description}
                </span>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  {param.values}
                </code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-green-600" />
            Example URLs
          </CardTitle>
          <CardDescription>
            Copy these URLs to test different strain generation options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {exampleUrls.map((example, index) => (
            <div key={index} className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{example.title}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(example.url)}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{example.description}</p>
              <code className="block text-xs bg-background p-2 rounded overflow-x-auto break-all">
                {example.url}
              </code>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default URLParameterHelper;
