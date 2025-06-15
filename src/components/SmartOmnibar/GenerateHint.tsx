
interface GenerateHintProps {
  searchTerm: string;
  hasResults: boolean;
}

const GenerateHint = ({ searchTerm, hasResults }: GenerateHintProps) => {
  const hasContent = searchTerm.trim().length > 0;
  
  if (hasResults || !hasContent) {
    return null;
  }

  return (
    <div className="text-center">
      <div className="bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm">
        💡 Press "Generate Info" to analyze "{searchTerm}"
      </div>
    </div>
  );
};

export default GenerateHint;
