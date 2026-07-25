/**
 * Non-identity mock metrics. These represent computed/AI-derived scores
 * that aren't yet backed by real analysis, so they remain mocked.
 * All real user identity data (name, avatar, education, target role, etc.)
 * now comes from the `profiles` table via useProfile().
 */
export const mockStats = {
  readinessScore: 72,
  resumeScore: 68
};

export const mockSkills = [
  { name: "React", level: 90, category: "Frontend" },
  { name: "TypeScript", level: 85, category: "Language" },
  { name: "Node.js", level: 75, category: "Backend" },
  { name: "Python", level: 80, category: "Language" },
  { name: "Machine Learning", level: 40, category: "AI" },
  { name: "System Design", level: 60, category: "Core" },
  { name: "DSA", level: 95, category: "Core" },
  { name: "SQL", level: 70, category: "Database" }
];

export const mockMissingSkills = [
  { name: "AWS", priority: "High", resources: ["AWS Certified Developer Course", "FreeCodeCamp AWS Tutorial"] },
  { name: "Docker", priority: "Medium", resources: ["Docker Mastery on Udemy"] },
  { name: "GraphQL", priority: "Low", resources: ["How to GraphQL"] }
];

export const mockApplications = [
  { id: 1, company: "Google", role: "SWE Intern", status: "Interview", date: "2024-03-10", logo: "SiGoogle" },
  { id: 2, company: "Microsoft", role: "SDE Intern", status: "Applied", date: "2024-03-15", logo: "SiMicrosoft" },
  { id: 3, company: "Atlassian", role: "Frontend Intern", status: "Screening", date: "2024-03-20", logo: "SiAtlassian" },
  { id: 4, company: "Amazon", role: "SDE Intern", status: "Rejected", date: "2024-02-15", logo: "SiAmazon" },
  { id: 5, company: "Stripe", role: "Software Engineer Intern", status: "Saved", date: "2024-03-22", logo: "SiStripe" },
];

export const mockProjects = [
  { id: 1, name: "CareerOS UI", description: "An AI-powered career assistant built with React and Tailwind CSS.", tech: ["React", "TypeScript", "Tailwind"], github: "https://github.com", live: "https://example.com", status: "Active" },
  { id: 2, name: "Algorithmic Trader", description: "Python bot to execute trades based on moving averages.", tech: ["Python", "Pandas", "Alpaca API"], github: "https://github.com", live: null, status: "Completed" },
  { id: 3, name: "Smart Campus", description: "IoT-based campus navigation system using React Native.", tech: ["React Native", "Firebase", "IoT"], github: "https://github.com", live: null, status: "Paused" },
];

export const mockCertificates = [
  { id: 1, name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2023-10", credentialId: "AWS-12345", verified: true },
  { id: 2, name: "Meta Frontend Developer", issuer: "Coursera", date: "2023-08", credentialId: "META-9876", verified: true },
  { id: 3, name: "Machine Learning A-Z", issuer: "Udemy", date: "2023-01", credentialId: "UC-4848", verified: false },
];

export const mockGoals = [
  { id: 1, title: "Complete System Design Course", type: "Short-term", progress: 75, deadline: "2024-04-15" },
  { id: 2, title: "Reach 200 LeetCode Problems", type: "Mid-term", progress: 40, deadline: "2024-06-01" },
  { id: 3, title: "Secure Tier-1 Internship", type: "Long-term", progress: 20, deadline: "2024-08-01" },
];

export const mockRoadmap = [
  { id: 1, stage: "Foundation", status: "Completed", tasks: ["Learn a programming language (C++/Java/Python)", "Understand Basic Data Structures", "Git & GitHub basics"] },
  { id: 2, stage: "Core Skills", status: "In Progress", tasks: ["Advanced DSA & LeetCode", "Web Development Fundamentals", "Databases (SQL/NoSQL)"] },
  { id: 3, stage: "Projects", status: "Pending", tasks: ["Build 2 major projects", "Contribute to Open Source", "Deploy applications"] },
  { id: 4, stage: "Internship Preparation", status: "Pending", tasks: ["Resume Building", "Mock Interviews", "Apply to 50+ companies"] },
  { id: 5, stage: "Placement", status: "Pending", tasks: ["System Design Basics", "Company-specific prep", "Offer Negotiation"] },
];

export const mockActivity = [
  { id: 1, action: "Completed mock interview with AI Mentor", time: "2 hours ago" },
  { id: 2, action: "Applied to Google SWE Intern role", time: "5 hours ago" },
  { id: 3, action: "Updated Resume (Score +4)", time: "1 day ago" },
  { id: 4, action: "Added new project 'CareerOS UI'", time: "2 days ago" },
  { id: 5, action: "Reached 15 day GitHub streak", time: "3 days ago" },
];

export const mockInterviewQuestions = [
  { id: 1, company: "Google", topic: "Arrays", difficulty: "Medium", question: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target." },
  { id: 2, company: "Microsoft", topic: "Trees", difficulty: "Hard", question: "Serialize and deserialize a binary tree." },
  { id: 3, company: "General", topic: "Behavioral", difficulty: "Easy", question: "Tell me about a time you faced a significant technical challenge and how you overcame it." },
];

export const mockGithubStats = {
  totalCommits: 1453,
  repos: 24,
  streak: 15,
  languages: [
    { name: "TypeScript", value: 45, color: "#3178c6" },
    { name: "Python", value: 30, color: "#3572A5" },
    { name: "HTML/CSS", value: 15, color: "#e34c26" },
    { name: "Other", value: 10, color: "#8b949e" }
  ]
};

export const mockResumeAnalysis = {
  score: 68,
  atsMatch: 75,
  clarity: 80,
  impact: 50,
  keywords: 65,
  suggestions: [
    "Quantify your impact in the 'Algorithmic Trader' project. (e.g. 'Improved efficiency by X%')",
    "Add 'AWS' and 'Docker' to your skills section to match target roles.",
    "Your summary is slightly too long. Keep it under 4 lines."
  ]
};

export const mockMentorChat = [
  { id: 1, sender: "mentor", text: "Hey Arjun! I noticed you haven't applied to any roles this week. Want me to suggest some SWE internships based on your profile?" },
  { id: 2, sender: "user", text: "Yes please, especially around frontend roles." },
  { id: 3, sender: "mentor", text: "Found 3 strong matches! Vercel, Linear, and Notion all opened Frontend Intern roles yesterday. Vercel perfectly matches your React and Next.js skills. Should we update your resume to highlight those?" },
  { id: 4, sender: "user", text: "That sounds great, let's do it." },
  { id: 5, sender: "mentor", text: "Awesome. Head over to the Resume Builder. I've highlighted the lines you should tweak." }
];
