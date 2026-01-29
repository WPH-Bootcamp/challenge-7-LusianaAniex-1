/**
 * Generates a data URL for an SVG placeholder image with the first letter of the name.
 * @param name The name to display the initial of.
 * @returns A data URL string representing the SVG image.
 */
export const getPlaceholderImage = (name: string): string => {
  const initial = name.charAt(0).toUpperCase();
  const svg = `
    <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" fill="#F3F4F6"/>
      <text x="40" y="45" text-anchor="middle" font-family="Arial" font-size="24" fill="#6B7280">
        ${initial}
      </text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
