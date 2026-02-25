import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="prose prose-sm prose-zinc py-8">
          <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>

          <h2 className="text-lg font-semibold mt-6 mb-2">What We Collect</h2>
          <p className="text-sm text-zinc-600 mb-4">
            We collect the information you provide during registration (name, email) and
            your assessment responses. Assessment responses are stored securely and only
            used in aggregate, anonymized form for compatibility analysis.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">How We Use Your Data</h2>
          <ul className="text-sm text-zinc-600 space-y-1 list-disc list-inside mb-4">
            <li>Generate compatibility reports using aggregated, anonymized responses</li>
            <li>Provide venture discovery analysis tailored to your team</li>
            <li>Send notifications about team activity (configurable)</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-2">Anonymity</h2>
          <p className="text-sm text-zinc-600 mb-4">
            Individual assessment responses are never shown to other team members.
            Only aggregated insights appear in reports. When data is sent to AI providers
            for analysis, it is anonymized (labeled as Partner A, Partner B, etc.)
            with no personally identifiable information.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Your Rights</h2>
          <ul className="text-sm text-zinc-600 space-y-1 list-disc list-inside mb-4">
            <li>Export all your personal data at any time (Settings → Your Data)</li>
            <li>Request account deletion with a 30-day cancellation window</li>
            <li>Configure notification preferences</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-2">Data Retention</h2>
          <p className="text-sm text-zinc-600 mb-4">
            Your data is retained as long as your account is active. Upon deletion request,
            data is permanently removed after a 30-day grace period. Assessment data
            contributing to team reports may be retained in anonymized, aggregated form.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Third Parties</h2>
          <p className="text-sm text-zinc-600 mb-4">
            We use AI providers (Anthropic, OpenAI) to generate reports and venture ideas.
            Only anonymized data is sent to these providers. We use Resend for transactional emails.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
