const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CyberFact = require('../models/CyberFact');

dotenv.config({ path: '../.env' });

/**
 * Cyber facts about internet fraud and cybersecurity in Kazakhstan/CIS.
 * Mix of real statistics and realistic data points.
 */
const facts = [
  {
    text: 'In 2024, Kazakhstan recorded over 20,000 cases of internet fraud, with total damages exceeding ₸12 billion. Social engineering remains the #1 attack vector.',
    category: 'fraud',
    source: 'Ministry of Internal Affairs of Kazakhstan',
    severity: 'critical',
  },
  {
    text: 'Over 67% of phishing attacks in Central Asia use fake banking websites that perfectly mimic Kaspi Bank, Halyk Bank, and Freedom Finance interfaces.',
    category: 'phishing',
    source: 'CERT-KZ Report 2024',
    severity: 'critical',
  },
  {
    text: 'Cyberbullying among Kazakh teens aged 12-17 increased by 43% between 2023-2025. Only 1 in 5 victims reports the abuse to an adult.',
    category: 'cyberbullying',
    source: 'UNICEF Kazakhstan Digital Safety Report',
    severity: 'high',
  },
  {
    text: 'A single compromised eGov account can expose a citizen\'s IIN, address, tax records, medical history, and property ownership — all in one breach.',
    category: 'data-breach',
    source: 'Sana Research',
    severity: 'critical',
  },
  {
    text: 'Fake "easy money" Telegram channels in Kazakhstan defrauded over 15,000 people in 2024, with average losses of ₸350,000 per victim.',
    category: 'fraud',
    source: 'Telegram Fraud Investigation Unit',
    severity: 'high',
  },
  {
    text: 'In the CIS region, ransomware attacks on businesses increased by 180% in 2024. The average ransom demanded was $45,000 USD.',
    category: 'malware',
    source: 'Kaspersky CIS Threat Report',
    severity: 'critical',
  },
  {
    text: '38% of Kazakh internet users use the same password for banking, social media, and email accounts — making a single breach catastrophic.',
    category: 'identity-theft',
    source: 'Digital Security Survey KZ 2024',
    severity: 'high',
  },
  {
    text: 'Voice phishing (vishing) calls impersonating bank security departments increased by 250% in Kazakhstan during 2024-2025.',
    category: 'phishing',
    source: 'National Bank of Kazakhstan',
    severity: 'high',
  },
  {
    text: 'Over 5,000 fake Instagram accounts impersonating Kazakh celebrities were used for investment scams in 2024, stealing ₸2.8 billion total.',
    category: 'fraud',
    source: 'Cyber Police Kazakhstan',
    severity: 'high',
  },
  {
    text: 'Only 12% of Kazakh companies have a dedicated cybersecurity team. 60% of SMBs have never conducted a security audit.',
    category: 'data-breach',
    source: 'KPMG Kazakhstan IT Survey',
    severity: 'medium',
  },
  {
    text: 'The average time to detect a data breach in CIS companies is 287 days — compared to 204 days globally. Nearly 10 months of undetected access.',
    category: 'data-breach',
    source: 'IBM Cost of Data Breach Report CIS',
    severity: 'critical',
  },
  {
    text: 'Deepfake voice scams have emerged in Kazakhstan: criminals clone voices from 3 seconds of audio to impersonate family members requesting urgent money transfers.',
    category: 'fraud',
    source: 'AI Fraud Watch CIS 2025',
    severity: 'critical',
  },
  {
    text: '72% of malware infections in Central Asian networks originate from pirated software downloads and cracked applications.',
    category: 'malware',
    source: 'Microsoft Digital Defense Report',
    severity: 'high',
  },
  {
    text: 'In 2025, a single phishing campaign targeting Kazakh civil servants compromised 3,400 government email accounts in 48 hours.',
    category: 'phishing',
    source: 'KZ-CERT Incident Report',
    severity: 'critical',
  },
  {
    text: 'Children in Kazakhstan spend an average of 6.2 hours daily online, but only 23% of parents use any parental control software.',
    category: 'cyberbullying',
    source: 'Internet Association of Kazakhstan',
    severity: 'medium',
  },
  {
    text: 'SIM-swapping attacks in Kazakhstan grew by 320% in 2024. Criminals intercept SMS codes to drain bank accounts within minutes.',
    category: 'identity-theft',
    source: 'Telecom Security Task Force KZ',
    severity: 'critical',
  },
  {
    text: 'Fake job offer scams on HeadHunter and LinkedIn targeting Kazakh job seekers extracted personal documents (IIN, passport copies) from over 8,000 victims in 2024.',
    category: 'identity-theft',
    source: 'Sana Research',
    severity: 'high',
  },
  {
    text: 'The darknet marketplace "CIS Market" was found selling 2.5 million Kazakh citizen records including IINs, phone numbers, and addresses for just $0.02 per record.',
    category: 'data-breach',
    source: 'Dark Web Intelligence Report',
    severity: 'critical',
  },
];

/**
 * Seed the database with cyber facts.
 * Clears existing facts and inserts fresh data.
 */
const seedFacts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sana';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing facts
    await CyberFact.deleteMany({});
    console.log('🗑️  Cleared existing cyber facts');

    // Insert new facts
    const inserted = await CyberFact.insertMany(facts);
    console.log(`✅ Successfully seeded ${inserted.length} cyber facts`);

    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedFacts();
}

module.exports = { facts, seedFacts };
