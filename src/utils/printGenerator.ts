
// Legacy compatibility layer - redirects to new modular system
export { generateOutput as generateStrainText } from './outputGenerators';
export { generateOutput as generateStrainImage } from './outputGenerators';
export { copyToClipboard, downloadText as downloadImage } from './outputGenerators';

// Re-export new system
export * from './outputGenerators';
