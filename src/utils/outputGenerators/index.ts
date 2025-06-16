
import { Strain } from '@/types/strain';
import { PrintConfig, OutputMode } from '@/types/printConfig';
import { generateAsciiTable } from './asciiTableGenerator';
import { generatePlainText } from './plainTextGenerator';
import { generateSocialMedia } from './socialMediaGenerator';
import { generateFullMenu } from './menuGenerator';
import { generateJson } from './jsonGenerator';

export const generateOutput = (
  mode: OutputMode,
  strain: Strain,
  config: PrintConfig,
  allStrains?: Strain[]
): string => {
  switch (mode) {
    case 'ascii-table':
      return generateAsciiTable(strain, config);
    case 'plain-text':
      return generatePlainText(strain, config);
    case 'social-media':
      return generateSocialMedia(strain, config);
    case 'full-menu':
      if (!allStrains) throw new Error('All strains required for menu generation');
      return generateFullMenu(allStrains, config);
    case 'json':
      return generateJson(strain, config);
    default:
      throw new Error(`Unknown output mode: ${mode}`);
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const downloadText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatFilename = (template: string, strainName: string): string => {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  
  return template
    .replace('{StrainName}', strainName.replace(/[^a-z0-9]/gi, '_'))
    .replace('{Date}', date)
    .replace('{Time}', time);
};
