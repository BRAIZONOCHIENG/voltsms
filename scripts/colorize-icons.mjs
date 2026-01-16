import fs from 'fs';
import path from 'path';
import * as simpleIcons from 'simple-icons';

const iconsDir = path.join(process.cwd(), 'public/icons');

// Helper to convert hex to rgb for specific use if needed, but hex is fine.
// Inject fill attribute into SVG
function colorizeSvg(svgContent, hex) {
    // SimpleIcons SVGs are usually: <svg ...><path d="..."/></svg>
    // We want to insert style="fill: #HEX" into the <svg> tag or <path> tag.
    // Easiest is to add fill="#..." to <svg> or <path>.

    // If it already has fill, replace it. If not, add it.
    // Most simple-icons don't have fill, they inherit or default black.

    // Strategy: replace '<svg' with '<svg fill="#hex"'
    if (svgContent.includes('fill=')) {
        // If it interacts with currentColor, this might break, but usually they don't have fill.
        return svgContent.replace(/fill="[^"]*"/, `fill="#${hex}"`);
    } else {
        return svgContent.replace('<svg', `<svg fill="#${hex}"`);
    }
}

async function run() {
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }

    console.log('Starting colorization of icons...');
    let count = 0;

    // Iterate over all exported icons
    for (const key in simpleIcons) {
        const icon = simpleIcons[key];
        if (!icon.slug || !icon.hex || !icon.svg) continue;

        const coloredSvg = colorizeSvg(icon.svg, icon.hex);
        const fileName = `${icon.slug}.svg`;
        const filePath = path.join(iconsDir, fileName);

        fs.writeFileSync(filePath, coloredSvg);
        count++;
    }

    console.log(`Successfully colorized and saved ${count} icons to ${iconsDir}`);
}

run();
