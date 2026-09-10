import fs from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const envVars = {
  ...dotenv.parse(fs.readFileSync('.env', 'utf-8')),
  ...dotenv.parse(fs.readFileSync('.env.local', 'utf-8')),
};

for (const [key, value] of Object.entries(envVars)) {
  if (value && key !== 'PAYMENT_QR_IMAGE_PATH') {
    try {
      console.log(`Fixing ${key}...`);
      
      // Remove old broken variables
      try { execSync(`vercel env rm ${key} production -y`); } catch(e) {}
      try { execSync(`vercel env rm ${key} preview -y`); } catch(e) {}
      try { execSync(`vercel env rm ${key} development -y`); } catch(e) {}

      // Add correctly using printf
      execSync(`printf "%s" "${value.replace(/"/g, '\\"')}" | vercel env add ${key} production`, { stdio: 'inherit' });
      execSync(`printf "%s" "${value.replace(/"/g, '\\"')}" | vercel env add ${key} preview`, { stdio: 'inherit' });
      execSync(`printf "%s" "${value.replace(/"/g, '\\"')}" | vercel env add ${key} development`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to add ${key}`);
    }
  }
}
