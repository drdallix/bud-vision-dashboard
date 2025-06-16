
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Database, Scan, Eye, Search, Settings } from 'lucide-react';

const ApiEndpoints = () => {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/strains',
      description: 'Get all strains for current user',
      params: '?type=indica&in_stock=true&search=og',
      example: 'https://yourapp.com/api/strains?type=indica&in_stock=true',
      icon: <Database className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      method: 'GET',
      path: '/api/strains/:id',
      description: 'Get specific strain by ID',
      params: '',
      example: 'https://yourapp.com/api/strains/abc123',
      icon: <Eye className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    {
      method: 'GET',
      path: '/api/scan/:id',
      description: 'Quick scan view for specific strain',
      params: '?format=json|qr|display',
      example: 'https://yourapp.com/api/scan/abc123?format=display',
      icon: <Scan className="h-5 w-5" />,
      color: 'bg-purple-500'
    },
    {
      method: 'POST',
      path: '/api/strains/:id/stock',
      description: 'Toggle strain stock status',
      params: '{"in_stock": true}',
      example: 'https://yourapp.com/api/strains/abc123/stock',
      icon: <Settings className="h-5 w-5" />,
      color: 'bg-orange-500'
    },
    {
      method: 'GET',
      path: '/api/search',
      description: 'Search strains with filters',
      params: '?q=purple&effects=relaxed&flavors=berry',
      example: 'https://yourapp.com/api/search?q=purple&effects=relaxed',
      icon: <Search className="h-5 w-5" />,
      color: 'bg-teal-500'
    }
  ];

  const qrCodeExamples = [
    {
      title: 'Direct Strain View',
      url: 'https://yourapp.com/strain/abc123',
      description: 'Opens strain details directly'
    },
    {
      title: 'Stock Toggle',
      url: 'https://yourapp.com/api/scan/abc123?action=toggle_stock',
      description: 'Quick stock management'
    },
    {
      title: 'Showcase Mode',
      url: 'https://yourapp.com/showcase?strain=abc123&autoplay=true',
      description: 'Fullscreen display mode'
    },
    {
      title: '30-Day Menu',
      url: 'https://yourapp.com/menu?filter=last_30_days&format=public',
      description: 'Public menu display'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          DoobieDB API Documentation
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          RESTful API endpoints for cannabis strain management and barcode integration
        </p>
      </div>

      {/* API Endpoints */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Code className="h-6 w-6" />
          API Endpoints
        </h2>
        
        <div className="grid gap-4">
          {endpoints.map((endpoint, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`${endpoint.color} p-2 rounded-lg text-white`}>
                  {endpoint.icon}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="font-mono">
                      {endpoint.method}
                    </Badge>
                    <code className="bg-muted px-3 py-1 rounded text-sm">
                      {endpoint.path}
                    </code>
                  </div>
                  
                  <p className="text-muted-foreground">
                    {endpoint.description}
                  </p>
                  
                  {endpoint.params && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Parameters:</span>
                      <code className="block bg-muted p-2 rounded text-xs overflow-x-auto">
                        {endpoint.params}
                      </code>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Example:</span>
                    <code className="block bg-muted p-2 rounded text-xs overflow-x-auto text-blue-600">
                      {endpoint.example}
                    </code>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* QR Code Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Scan className="h-6 w-6" />
          QR Code Integration Examples
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {qrCodeExamples.map((example, index) => (
            <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{example.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{example.description}</p>
              <code className="block bg-muted p-2 rounded text-xs overflow-x-auto text-green-600">
                {example.url}
              </code>
            </Card>
          ))}
        </div>
      </div>

      {/* Authentication */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Authentication</h3>
        <div className="space-y-3 text-sm">
          <p>All API endpoints require authentication via:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Bearer token in Authorization header</li>
            <li>Session cookie for web requests</li>
            <li>API key for barcode scanners</li>
          </ul>
          <code className="block bg-muted p-2 rounded text-xs">
            Authorization: Bearer your-jwt-token-here
          </code>
        </div>
      </Card>

      {/* Response Format */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Response Format</h3>
        <code className="block bg-muted p-4 rounded text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "strain": {
      "id": "abc123",
      "name": "Purple Haze",
      "type": "Sativa",
      "thc": 18.5,
      "cbd": 0.8,
      "in_stock": true,
      "effects": ["euphoric", "creative", "uplifting"],
      "flavors": ["sweet", "berry", "earthy"]
    }
  },
  "timestamp": "2025-06-16T20:08:40Z"
}`}
        </code>
      </Card>
    </div>
  );
};

export default ApiEndpoints;
