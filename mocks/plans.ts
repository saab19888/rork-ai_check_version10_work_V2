import { SubscriptionPlan } from "@/types";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free-trial",
    name: "Free Trial",
    description: "🚀 Start instantly - No credit card required! Perfect for testing our AI detection capabilities with immediate access to core features.",
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      "7-day full access",
      "5 document checks",
      "Basic reports & confidence scores",
      "Text analysis with highlighting",
      "Mobile & web access",
    ],
    checkLimit: 5,
  },
  {
    id: "basic",
    name: "Basic",
    description: "💡 Best value for individuals - Only €10/month! Ideal for students, writers, and content creators who need reliable AI detection.",
    price: {
      monthly: 10,
      yearly: 10,
    },
    features: [
      "50 checks/month (20¢ per check)",
      "Detailed analysis reports",
      "PDF exports & file uploads",
      "Email support within 24h",
      "History tracking",
    ],
    checkLimit: 50,
  },
  {
    id: "premium",
    name: "Premium",
    description: "⭐ Most popular choice - €20/month for professionals! Advanced features, priority support, and bulk processing for serious users.",
    price: {
      monthly: 20,
      yearly: 20,
    },
    features: [
      "200 checks/month (10¢ per check)",
      "Advanced analytics & insights",
      "Priority support (2h response)",
      "Bulk file processing",
      "Limited API access",
      "Custom report branding",
    ],
    checkLimit: 200,
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "🏢 Custom solutions for teams - Unlimited usage, full API access, and dedicated support. Perfect for organizations and institutions.",
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      "Unlimited checks & users",
      "Full API access & webhooks",
      "Team dashboard & analytics",
      "Custom integrations & SSO",
      "Dedicated account manager",
      "SLA guarantee & white-label",
    ],
    checkLimit: Infinity,
  },
];