export const defaultSiteContent = {
  contact: {
    phone: "+91 77038 99347",
    email: "sales@ecoreinfotech.com",
    offices: [
      {
        title: "Registered office",
        address: "Ellahi Bagh, Buchpora",
        city: "Srinagar – 190020, Jammu & Kashmir",
      },
      {
        title: "Corporate office",
        address: "First Floor, Office No. F2, Qureshi Estate, Karan Nagar",
        city: "Srinagar – 190010",
      },
      {
        title: "Sales office",
        address: "IGNOU Road, Neb Sarai",
        city: "New Delhi – 110068",
      },
    ],
  },
  faqs: [
    {
      question: "Can a database be tailored to a specific industry or region?",
      answer:
        "Yes. Share the industries, locations, organization types, and roles you have in mind. We scope research to the requirements and intended use you provide.",
    },
    {
      question: "How is information prepared before delivery?",
      answer:
        "The agreed fields are researched, structured, and reviewed for consistency and completeness. The scope and verification approach are confirmed before work begins.",
    },
    {
      question: "What file formats are available?",
      answer:
        "Records can be prepared in practical spreadsheet formats for review and import. If your team has a specific CRM template, include it in your brief.",
    },
    {
      question: "How do I request a sample or quote?",
      answer:
        "Use the contact page to describe your audience, geography, and preferred fields. The team can then confirm what is feasible and provide the next steps.",
    },
    {
      question: "Can you help clean an existing database?",
      answer:
        "Yes. Data conversion and enhancement work can be scoped around the files you have and the cleanup or formatting your team needs.",
    },
  ],
  testimonials: [
    {
      quote:
        "A clear brief and a well-structured list make it much easier for a sales team to focus its outreach.",
      name: "Illustrative client perspective",
      role: "Sales operations",
    },
    {
      quote:
        "Getting information in a consistent format helps our team spend less time preparing files and more time acting on them.",
      name: "Illustrative client perspective",
      role: "Marketing team",
    },
    {
      quote:
        "The best research starts with listening carefully to who you need to reach and why.",
      name: "Illustrative client perspective",
      role: "Business development",
    },
  ],
};

export type SiteContentData = typeof defaultSiteContent;
