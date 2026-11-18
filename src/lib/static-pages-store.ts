import { getSiteSettingAsync, saveSiteSettingAsync } from "./site-settings";

export interface AboutPageConfig {
  badgeText: string;
  heading: string;
  subheading: string;
  missionTitle: string;
  missionParagraph1: string;
  missionParagraph2: string;
  whyTrustTitle: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  ctaTitle: string;
  ctaSubtitle: string;
}

export interface ContactPageConfig {
  badgeText: string;
  heading: string;
  subheading: string;
  supportEmail: string;
  telegramUrl: string;
  telegramHandle: string;
  phone: string;
  workingHours: string;
  officeAddress: string;
  responseTime: string;
}

export interface PolicyPageConfig {
  heading: string;
  lastUpdated: string;
  contentHtml: string;
}

export interface StaticPagesConfig {
  about: AboutPageConfig;
  contact: ContactPageConfig;
  privacy: PolicyPageConfig;
  terms: PolicyPageConfig;
  refund: PolicyPageConfig;
}

export const DEFAULT_STATIC_PAGES_CONFIG: StaticPagesConfig = {
  about: {
    badgeText: "Empowering Aspirants Across India",
    heading: "About SSCZone",
    subheading: "India's dedicated platform for syllabus-wise MCQ practice, standard book questions, and real exam test series.",
    missionTitle: "Our Mission",
    missionParagraph1: "SSCZone was built with a simple goal: To make competitive exam preparation systematic, targeted, and affordable for every student. Instead of random practice questions, we structure every single MCQ strictly according to official exam syllabi published by SSC, UPSC, State PSCs, and Railway Recruitment Boards.",
    missionParagraph2: "Whether you are preparing for SSC CGL, CHSL, MTS, CPO, RRB NTPC, or UPSC CSAT, SSCZone enables you to complete your preparation chapter-by-chapter with instant answer explanations and previous year question (PYQ) test papers.",
    whyTrustTitle: "Why Aspirants Trust SSCZone",
    feature1Title: "Strict Syllabus Alignment",
    feature1Desc: "Every topic is mapped directly to official exam notifications, ensuring zero wasted time on out-of-syllabus questions.",
    feature2Title: "Standard Reference Books",
    feature2Desc: "Curated MCQs inspired by standard reference textbooks and previous year question banks.",
    feature3Title: "Detailed Explanations",
    feature3Desc: "Step-by-step solutions and explanations for every question to build conceptual clarity.",
    ctaTitle: "Ready to start your exam preparation?",
    ctaSubtitle: "Explore our syllabus-wise practice modules and attempt previous year papers today.",
  },
  contact: {
    badgeText: "We're Here to Help",
    heading: "Contact SSCZone Support",
    subheading: "Have questions about subscription plans, test series, or syllabus content? Reach out to us.",
    supportEmail: "support@ssczone.com",
    telegramUrl: "https://t.me/ssczone",
    telegramHandle: "@ssczone",
    phone: "+91 98765 43210",
    workingHours: "Monday to Saturday (9:00 AM – 7:00 PM IST)",
    officeAddress: "SSCZone Educational Technologies, New Delhi, India",
    responseTime: "Within 24 Hours",
  },
  privacy: {
    heading: "Privacy Policy",
    lastUpdated: "January 2026",
    contentHtml: `<div>
  <h2 class="text-lg font-bold text-gray-900 mb-2">1. Introduction</h2>
  <p>Welcome to <b>SSCZone</b> ("we", "our", "us"). We value your trust and are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <b>ssczone.com</b> or use our online services.</p>
</div>
<div>
  <h2 class="text-lg font-bold text-gray-900 mb-2">2. Information We Collect</h2>
  <ul class="list-disc pl-5 space-y-1">
    <li><b>Personal Identification:</b> Name, email address, phone number when creating an account or subscribing to a package.</li>
    <li><b>Payment Information:</b> Payment details processed securely via Razorpay payment gateway (we do not store credit card numbers on our servers).</li>
    <li><b>Usage & Progress Data:</b> Test attempt scores, question bookmarks, topic accuracy, and learning performance.</li>
  </ul>
</div>
<div>
  <h2 class="text-lg font-bold text-gray-900 mb-2">3. How We Use Your Data</h2>
  <p>We use the collected information to manage user accounts, deliver test series, track study progress, process payments, and improve platform features.</p>
</div>
<div>
  <h2 class="text-lg font-bold text-gray-900 mb-2">4. Data Security</h2>
  <p>We implement industry-standard encryption, SSL certification, and secure cloud database safeguards to protect your personal information.</p>
</div>
<div>
  <h2 class="text-lg font-bold text-gray-900 mb-2">5. Contact Us</h2>
  <p>If you have any questions about this Privacy Policy, please email us at <b>support@ssczone.com</b>.</p>
</div>`,
  },
  terms: {
    heading: "Terms & Conditions",
    lastUpdated: "January 2026",
    contentHtml: `<div>
  <h2 class="text-lg font-bold text-gray-900 mb-2">1. Terms of Use</h2>
  <p>By accessing or using <b>SSCZone</b>, you agree to comply with and be bound by these Terms and Conditions. If you do not agree with any part of these terms, you should not access the service.</p>
</div>
<div>
  <h2 class="text-lg font-bold text-gray-900 mb-2">2. Intellectual Property</h2>
  <p>All questions, solution explanations, UI designs, graphics, and software code on SSCZone are the intellectual property of SSCZone Educational Technologies.</p>
</div>
<div>
  <h2 class="text-lg font-bold text-gray-900 mb-2">3. Subscription & Pass Access</h2>
  <p>Subscriptions grant access to premium test series and practice modules for the specified duration. Passes are non-transferable and intended for single-user candidate use only.</p>
</div>
<div>
  <h2 class="text-lg font-bold text-gray-900 mb-2">4. User Accounts</h2>
  <p>Users are responsible for maintaining confidentiality of account credentials. Account sharing or unauthorized automated scraping of questions is strictly prohibited.</p>
</div>`,
  },
  refund: {
    heading: "Refund & Cancellation Policy",
    lastUpdated: "January 2026",
    contentHtml: `<div>
  <h2 class="text-lg font-bold text-gray-900 mb-2">1. Digital Subscriptions</h2>
  <p>SSCZone provides instant digital access to practice questions, solution explanations, and test series. Due to the digital nature of the content, purchases are non-refundable once content access is granted.</p>
</div>
<div>
  <h2 class="text-lg font-bold text-gray-900 mb-2">2. Double Deduction / Payment Errors</h2>
  <p>In case of double payment deduction due to a technical error during Razorpay checkout, the extra amount will be refunded automatically to your original payment method within 5–7 business days.</p>
</div>
<div>
  <h2 class="text-lg font-bold text-gray-900 mb-2">3. Refund Requests</h2>
  <p>For payment queries or double charge issues, please contact us at <b>support@ssczone.com</b> with your order ID and payment reference number.</p>
</div>`,
  },
};

const SITE_SETTING_KEY = "static_pages_config";

export async function getStaticPagesConfigAsync(): Promise<StaticPagesConfig> {
  return await getSiteSettingAsync<StaticPagesConfig>(SITE_SETTING_KEY, DEFAULT_STATIC_PAGES_CONFIG);
}

export async function saveStaticPagesConfigAsync(config: StaticPagesConfig): Promise<boolean> {
  return await saveSiteSettingAsync<StaticPagesConfig>(SITE_SETTING_KEY, config);
}
