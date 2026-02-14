const fs = require('fs');
const path = require('path');

const servicesPath = path.join(process.cwd(), 'src/app/dashboard/services_data.ts');
const popularPath = path.join(process.cwd(), 'src/app/dashboard/popular_services.ts');

const content = fs.readFileSync(servicesPath, 'utf8');

// Use regex to find the array content
const match = content.match(/\[([\s\S]*)\]/);
if (!match) {
    console.error('Could not find array in services_data.ts');
    process.exit(1);
}

const servicesArrayStr = `[${match[1]}]`;
const services = eval(servicesArrayStr); // Safe here as it's our own static data file

const popularServices = services.filter(s => s.category === 'Popular');

const popularContent = `/* Generated popular services snippet */
import { Service } from './services';

export const POPULAR_SERVICES: Service[] = ${JSON.stringify(popularServices, null, 4)};
`;

fs.writeFileSync(popularPath, popularContent);
console.log(`Extracted ${popularServices.length} popular services to popular_services.ts`);
