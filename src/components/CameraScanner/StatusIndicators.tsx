
import { CheckCircle, AlertCircle } from 'lucide-react';

interface StatusIndicatorsProps {
  saveStatus: 'idle' | 'saving' | 'success' | 'failed' | 'cached';
  user: any;
}

const StatusIndicators = ({ saveStatus, user }: StatusIndicatorsProps) => {
  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cached':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'success':
        return 'Saved to cloud';
      case 'cached':
        return 'Saved locally (will sync)';
      case 'failed':
        return 'Save failed';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Budtender Instructions */}
      <div className="bg-accent/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-accent-foreground">Budtender Scanning Tips:</h4>
        <ul className="text-sm text-accent-foreground/80 space-y-1">
          <li>• Ensure package labels are clearly visible and well-lit</li>
          <li>• Include strain name, THC/CBD percentages, and lab results</li>
          <li>• Capture the entire package label in one shot</li>
          <li>• Works best with high-resolution, clear images</li>
          <li>• Perfect for quick customer consultations</li>
        </ul>
      </div>

      {/* Cache Status */}
      {user && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <CheckCircle className="h-4 w-4" />
            <span>Local backup enabled - scans saved offline will sync automatically</span>
          </div>
        </div>
      )}

      {/* Save Status Display */}
      {saveStatus !== 'idle' && (
        <div className="flex items-center gap-1 text-sm">
          {getSaveStatusIcon()}
          <span>{getSaveStatusText()}</span>
        </div>
      )}
    </div>
  );
};

export default StatusIndicators;
