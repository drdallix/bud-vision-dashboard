
interface GenerateHintProps {
  hasResults: boolean;
  hasContent: boolean;
  isScanning: boolean;
}

const GenerateHint = ({ hasResults, hasContent, isScanning }: GenerateHintProps) => {
  if (hasResults || !hasContent || isScanning) {
    return null;
  }

  return (
    <div className="text-center">
      <div className="bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm">
        💡 Press Enter or click search to generate strain information
      </div>
    </div>
  );
};

export default GenerateHint;
