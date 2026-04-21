/**
 * Life Scenario simulation data.
 * Each scenario simulates a real-world cybersecurity threat situation
 * that a typical Kazakh internet user might encounter.
 */
const scenarios = [
  {
    id: 'phishing-email',
    title: 'Suspicious Bank Email',
    icon: '📧',
    category: 'Phishing',
    description:
      'You receive an email from "Kaspi Bank Security Department" saying your account has been compromised. The email asks you to click a link and enter your card details to "verify your identity." The sender address is security@kaspi-bank-verify.kz.',
    choices: [
      {
        id: 'a',
        text: 'Click the link immediately — my money could be at risk!',
        isCorrect: false,
        feedback:
          '🚨 DANGEROUS! This is a classic phishing attack. The real Kaspi Bank domain is kaspi.kz, not "kaspi-bank-verify.kz". Never click links in urgent emails. Scammers create panic to make you act without thinking.',
      },
      {
        id: 'b',
        text: 'Check the sender\'s email address carefully and compare it with the official domain',
        isCorrect: true,
        feedback:
          '✅ CORRECT! Always verify the sender\'s domain. Real banks use their official domain (kaspi.kz). The fake domain "kaspi-bank-verify.kz" is a clear red flag. Report such emails as phishing.',
      },
      {
        id: 'c',
        text: 'Forward the email to friends to warn them',
        isCorrect: false,
        feedback:
          '⚠️ NOT IDEAL. While your intention is good, forwarding phishing emails can accidentally spread the threat. Instead, report the email to your email provider and the real bank\'s security team.',
      },
      {
        id: 'd',
        text: 'Call the bank directly using the official number from their website',
        isCorrect: true,
        feedback:
          '✅ SMART MOVE! Calling the bank directly through their official number is a safe way to verify any security alerts. Never use contact information from suspicious emails.',
      },
    ],
  },
  {
    id: 'fake-sms',
    title: 'Prize Winning SMS',
    icon: '📱',
    category: 'Fraud',
    description:
      'You receive an SMS: "Congratulations! You won ₸500,000 in the Beeline Lucky Draw! Click this link to claim your prize within 24 hours or it will be transferred to another winner. Link: bit.ly/win-500k"',
    choices: [
      {
        id: 'a',
        text: 'Click the link quickly — ₸500,000 is a lot of money!',
        isCorrect: false,
        feedback:
          '🚨 SCAM! You never entered any contest. Legitimate prize draws never ask you to click suspicious shortened links. This is designed to steal your personal data or install malware on your phone.',
      },
      {
        id: 'b',
        text: 'Ignore and delete the message',
        isCorrect: true,
        feedback:
          '✅ CORRECT! If you never entered a contest, you can\'t win one. Unsolicited prize messages are always scams. Delete the message and block the sender.',
      },
      {
        id: 'c',
        text: 'Reply asking for more details about the prize',
        isCorrect: false,
        feedback:
          '⚠️ BAD IDEA! Replying confirms your number is active, which leads to more scam messages. Scammers sell "verified active numbers" to other criminal networks.',
      },
      {
        id: 'd',
        text: 'Report the number to Beeline\'s official fraud department',
        isCorrect: true,
        feedback:
          '✅ EXCELLENT! Reporting scam numbers helps telecom companies block them and protect other users. You can also report to Kazakhstan\'s cyber police.',
      },
    ],
  },
  {
    id: 'cyberbullying',
    title: 'Online Harassment',
    icon: '💬',
    category: 'Cyberbullying',
    description:
      'Your younger sibling shows you their Instagram. A group of classmates created a fake account using their photos, posting embarrassing edited images and mean comments. Your sibling is crying and doesn\'t want to go to school.',
    choices: [
      {
        id: 'a',
        text: 'Create a fake account and bully the bullies back',
        isCorrect: false,
        feedback:
          '🚨 WRONG! Retaliating with more cyberbullying makes the situation worse and could get YOU in legal trouble. Two wrongs don\'t make a right.',
      },
      {
        id: 'b',
        text: 'Screenshot all evidence, report the fake account, and tell a trusted adult/teacher',
        isCorrect: true,
        feedback:
          '✅ PERFECT RESPONSE! Document everything (screenshots with dates), report the fake account to Instagram, inform the school administration, and support your sibling emotionally. In Kazakhstan, cyberbullying can be reported to police under Article 174 of the Criminal Code.',
      },
      {
        id: 'c',
        text: 'Tell your sibling to just ignore it and it will stop',
        isCorrect: false,
        feedback:
          '⚠️ HARMFUL ADVICE. Ignoring cyberbullying rarely makes it stop and can cause severe psychological damage. Victims need active support and intervention from adults.',
      },
      {
        id: 'd',
        text: 'Delete all social media accounts immediately',
        isCorrect: false,
        feedback:
          '⚠️ NOT THE SOLUTION. Deleting accounts removes evidence needed for reporting and lets the bullies "win." The right approach is to document, report, and seek help while keeping the accounts as evidence.',
      },
    ],
  },
  {
    id: 'social-engineering',
    title: 'Tech Support Call',
    icon: '📞',
    category: 'Social Engineering',
    description:
      'You receive a call from someone claiming to be from "Microsoft Security Center." They say your computer has been hacked and is spreading viruses. They ask you to install a remote access program so they can "fix" it. They sound very professional.',
    choices: [
      {
        id: 'a',
        text: 'Follow their instructions — they sound legitimate and it\'s Microsoft!',
        isCorrect: false,
        feedback:
          '🚨 SCAM! Microsoft NEVER makes unsolicited calls about your computer. Installing remote access software gives criminals complete control of your PC, allowing them to steal passwords, files, and banking information.',
      },
      {
        id: 'b',
        text: 'Ask for their employee ID and call Microsoft\'s official support number to verify',
        isCorrect: true,
        feedback:
          '✅ SMART! Always independently verify by calling the company\'s official support line. Never trust caller-provided numbers. Real tech support will never pressure you or create urgency.',
      },
      {
        id: 'c',
        text: 'Hang up immediately',
        isCorrect: true,
        feedback:
          '✅ CORRECT! The safest action is to hang up. Microsoft, Apple, and other tech companies never make unsolicited calls. If you\'re worried about your computer, contact official support yourself.',
      },
      {
        id: 'd',
        text: 'Give them limited access to check just one thing',
        isCorrect: false,
        feedback:
          '🚨 DANGEROUS! There\'s no such thing as "limited" remote access. Once they\'re in, they have full control. Even a few seconds of access is enough to install backdoor malware.',
      },
    ],
  },
  {
    id: 'fake-investment',
    title: 'Crypto Investment Opportunity',
    icon: '💰',
    category: 'Investment Fraud',
    description:
      'A popular Kazakh Instagram blogger posts about an "exclusive crypto trading platform" that guarantees 300% returns in 30 days. They show screenshots of huge profits and say "only 50 spots left." The link goes to a professional-looking website.',
    choices: [
      {
        id: 'a',
        text: 'Invest a small amount to test it first — what\'s the worst that could happen?',
        isCorrect: false,
        feedback:
          '🚨 TRAP! Scam platforms often pay small "returns" initially to build trust, then encourage larger deposits before disappearing. This is a classic Ponzi scheme tactic. Even small investments validate the scam.',
      },
      {
        id: 'b',
        text: 'Research the platform: check for registration with AFSA (Astana Financial Services Authority)',
        isCorrect: true,
        feedback:
          '✅ EXCELLENT! Legitimate investment platforms must be registered with AFSA in Kazakhstan. No legitimate investment can "guarantee" 300% returns. The AFSA website maintains a list of licensed financial organizations.',
      },
      {
        id: 'c',
        text: 'Ask the blogger for more details in DMs',
        isCorrect: false,
        feedback:
          '⚠️ RISKY! Many influencer scam promotions use bots for DM responses. The blogger may be paid for promotion or their account may be hacked. Never make financial decisions based on social media endorsements.',
      },
      {
        id: 'd',
        text: 'Report the post to Instagram and warn your followers',
        isCorrect: true,
        feedback:
          '✅ RESPONSIBLE! Reporting investment scams protects others. In Kazakhstan, you can also report financial fraud to the National Bank hotline (1414) and Cyber Police.',
      },
    ],
  },
];

export default scenarios;
