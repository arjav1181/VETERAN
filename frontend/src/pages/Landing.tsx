import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VeteranButton } from '@ui/VeteranButton';
import {
  GitFork,
  GitPullRequest,
  Play,
  Laptop,
  Package,
  Shield,
  Star,
  ArrowRight,
  ExternalLink,
  Check,
  X,
  ChevronRight,
  Github,
  MessageSquare,
  BookOpen,
  Terminal,
  Heart,
} from 'lucide-react';
import { cn } from '../lib/utils';

const features = [
  {
    icon: GitFork,
    title: 'Git Hosting',
    description: 'Unlimited repositories with fine-grained access control, branch protection, and LFS support.',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    border: 'hover:border-emerald-500/30',
    glow: 'shadow-emerald-500/5',
  },
  {
    icon: GitPullRequest,
    title: 'Pull Requests',
    description: 'Review code with inline comments, suggestions, and required status checks before merge.',
    gradient: 'from-blue-500/20 to-blue-500/5',
    border: 'hover:border-blue-500/30',
    glow: 'shadow-blue-500/5',
  },
  {
    icon: Play,
    title: 'Actions CI/CD',
    description: 'Automate builds, tests, and deployments with a powerful YAML-based pipeline system.',
    gradient: 'from-purple-500/20 to-purple-500/5',
    border: 'hover:border-purple-500/30',
    glow: 'shadow-purple-500/5',
  },
  {
    icon: Laptop,
    title: 'Codespaces',
    description: 'Spin up full dev environments in seconds. Code from any browser, anywhere.',
    gradient: 'from-amber-500/20 to-amber-500/5',
    border: 'hover:border-amber-500/30',
    glow: 'shadow-amber-500/5',
  },
  {
    icon: Package,
    title: 'Packages',
    description: 'Host and share npm, Docker, Maven, and more. Integrated right into your workflow.',
    gradient: 'from-rose-500/20 to-rose-500/5',
    border: 'hover:border-rose-500/30',
    glow: 'shadow-rose-500/5',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Dependency scanning, secret detection, and Dependabot alerts to keep your code safe.',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
    border: 'hover:border-cyan-500/30',
    glow: 'shadow-cyan-500/5',
  },
];

const comparisonRows = [
  { feature: 'Unlimited private repos', veteran: true, free: false, enterprise: true },
  { feature: 'Unlimited collaborators', veteran: true, free: false, enterprise: true },
  { feature: 'CI/CD minutes per month', veteran: 'Unlimited', free: '2,000', enterprise: '50,000' },
  { feature: 'Storage per repo', veteran: 'Unlimited', free: '500 MB', enterprise: '50 GB' },
  { feature: 'Audit log', veteran: true, free: false, enterprise: true },
  { feature: 'SSO / SAML', veteran: true, free: false, enterprise: true },
  { feature: 'Secret scanning', veteran: true, free: false, enterprise: true },
  { feature: 'Self-hosted option', veteran: true, free: false, enterprise: 'Add-on $999/mo' },
  { feature: 'Rate limits', veteran: 'None', free: '5,000/hr', enterprise: '15,000/hr' },
  { feature: 'Telemetry', veteran: 'Zero telemetry', free: 'Required', enterprise: 'Required' },
  { feature: 'Price', veteran: 'Free forever', free: 'Free', enterprise: '$3.67/user/mo' },
];

const footerLinks = [
  { label: 'Docs', href: '/docs', icon: BookOpen },
  { label: 'GitHub', href: 'https://github.com/veteran-git/veteran', icon: Github },
  { label: 'Discord', href: 'https://discord.gg/veteran', icon: MessageSquare },
  { label: 'Blog', href: '/blog', icon: BookOpen },
  { label: 'Security', href: '/security', icon: Shield },
  { label: 'Status', href: '/status', icon: Heart },
];

function CountUp({ value, suffix = '' }: { value: string; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl sm:text-4xl font-bold tracking-tight text-[#E6EDF3]"
    >
      {value}{suffix}
    </motion.span>
  );
}

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-[#3FB950]" />
    ) : (
      <X className="w-5 h-5 text-[#484F58]" />
    );
  }
  return <span className="text-sm text-[#E6EDF3]">{value}</span>;
}

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <nav className="sticky top-0 z-50 border-b border-[#30363D] bg-[#0D1117]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E8B84B] to-[#E8B84B]/60 rounded-lg rotate-3 group-hover:rotate-6 transition-transform duration-300" />
                <div className="absolute inset-0 bg-[#1C2128] rounded-lg flex items-center justify-center border border-[#30363D]">
                  <GitFork className="w-5 h-5 text-[#E8B84B]" />
                </div>
              </div>
              <span className="font-bold text-xl text-[#E6EDF3] tracking-tight">VETERAN</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <a href="/docs" className="text-sm text-[#8D96A0] hover:text-[#E6EDF3] transition-colors">
                Docs
              </a>
              <a href="/explore" className="text-sm text-[#8D96A0] hover:text-[#E6EDF3] transition-colors">
                Explore
              </a>
              <a href="/pricing" className="text-sm text-[#8D96A0] hover:text-[#E6EDF3] transition-colors">
                Pricing
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-[#8D96A0] hover:text-[#E6EDF3] transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <VeteranButton
                onClick={() => navigate('/signup')}
                size="sm"
                className="!bg-[#E8B84B] !text-[#0D1117] hover:!bg-[#E8B84B]/90 !font-semibold"
              >
                Get Started
              </VeteranButton>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8B84B]/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E8B84B]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#4493F8]/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none mb-4">
                <span className="bg-gradient-to-r from-[#E8B84B] via-[#E8B84B]/90 to-[#E8B84B]/70 bg-clip-text text-transparent">
                  VETERAN
                </span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <p className="text-2xl sm:text-3xl text-[#8D96A0] font-light tracking-wide mb-6">
                Where code goes to war.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-lg sm:text-xl text-[#8D96A0] max-w-2xl mx-auto mb-10 leading-relaxed">
                The self-hosted, open-source Git platform for teams who ship.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
            >
              <VeteranButton
                onClick={() => navigate('/signup')}
                size="xl"
                className="!bg-[#E8B84B] !text-[#0D1117] hover:!bg-[#E8B84B]/90 !font-semibold !px-8 !shadow-lg !shadow-[#E8B84B]/20"
              >
                Get Started &mdash; it&apos;s free
                <ArrowRight className="w-5 h-5" />
              </VeteranButton>
              <VeteranButton
                onClick={() => navigate('/explore')}
                size="xl"
                variant="outline"
                className="!border-[#30363D] !text-[#E6EDF3] hover:!bg-[#1C2128] !px-8"
              >
                Deploy on your server
                <ExternalLink className="w-5 h-5" />
              </VeteranButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center justify-center gap-2 text-sm text-[#484F58]"
            >
              <Shield className="w-4 h-4 text-[#3FB950]" />
              <span>No rate limits. No telemetry. Your data, your infrastructure.</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#E8B84B] fill-[#E8B84B]" />
                <span className="text-sm text-[#8D96A0]">
                  <span className="text-[#E6EDF3] font-semibold">12,483</span> on GitHub
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GitFork className="w-5 h-5 text-[#8D96A0]" />
                <span className="text-sm text-[#8D96A0]">
                  Used by <span className="text-[#E6EDF3] font-semibold">4,200</span> teams
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#3FB950]" />
                <span className="text-sm text-[#8D96A0]">
                  <span className="text-[#E6EDF3] font-semibold">100%</span> open source
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-[#30363D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-[#E6EDF3] mb-4"
            >
              Everything you need to ship
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-[#8D96A0] max-w-2xl mx-auto"
            >
              A complete platform for code collaboration, from first commit to production deploy.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22] p-6 transition-all duration-300',
                    feature.border,
                    'hover:border-opacity-100 hover:shadow-lg hover:-translate-y-0.5',
                    feature.glow
                  )}
                >
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500', feature.gradient)} />
                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-lg bg-[#1C2128] border border-[#30363D] flex items-center justify-center mb-4 group-hover:border-[#E8B84B]/30 transition-colors">
                      <Icon className="w-5 h-5 text-[#E8B84B]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#E6EDF3] mb-2">{feature.title}</h3>
                    <p className="text-sm text-[#8D96A0] leading-relaxed">{feature.description}</p>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Icon className="w-full h-full" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[#30363D] bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <CountUp value="2.1M" suffix="+" />
              <p className="mt-2 text-sm text-[#8D96A0]">repositories hosted</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <CountUp value="847K" suffix="+" />
              <p className="mt-2 text-sm text-[#8D96A0]">pull requests merged</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <CountUp value="12M" suffix="+" />
              <p className="mt-2 text-sm text-[#8D96A0]">commits pushed</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <CountUp value="99.99" suffix="%" />
              <p className="mt-2 text-sm text-[#8D96A0]">uptime</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-[#30363D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-[#E6EDF3] text-center mb-16"
          >
            Veterans, not promises
          </motion.h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[#30363D]">
                  <th className="text-left py-4 pr-6 text-sm font-medium text-[#8D96A0]">Feature</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-[#E8B84B] w-[160px]">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8B84B]/10 border border-[#E8B84B]/20">
                      <Star className="w-3.5 h-3.5 fill-[#E8B84B]" />
                      Veteran
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-[#8D96A0] w-[160px]">GitHub Free</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-[#8D96A0] w-[160px]">GitHub Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-[#21262D] hover:bg-[#161B22]/50 transition-colors">
                    <td className="py-3 pr-6 text-sm text-[#E6EDF3]">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <ComparisonCell value={row.veteran} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <ComparisonCell value={row.free} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <ComparisonCell value={row.enterprise} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-lg text-[#E8B84B] font-semibold mb-2">Unlimited everything. No hidden costs.</p>
            <p className="text-sm text-[#8D96A0]">Veteran is and always will be free for individuals and teams.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 border-t border-[#30363D] bg-[#161B22]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-[#E6EDF3] text-center mb-8"
          >
            Install in one command
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-[#30363D] bg-[#0D1117] overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363D] bg-[#161B22]">
              <div className="w-3 h-3 rounded-full bg-[#F85149]" />
              <div className="w-3 h-3 rounded-full bg-[#D29922]" />
              <div className="w-3 h-3 rounded-full bg-[#3FB950]" />
              <span className="ml-2 text-xs text-[#484F58] font-mono">terminal</span>
            </div>
            <div className="p-5 font-mono text-sm leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="text-[#3FB950] select-none">$</span>
                <div>
                  <p className="text-[#E6EDF3]">
                    <span className="text-[#4493F8]">docker pull</span> veterangit/veteran:latest
                  </p>
                  <p className="text-[#E6EDF3] mt-1">
                    <span className="text-[#4493F8]">docker run</span> -d \
                  </p>
                  <p className="text-[#E6EDF3] pl-6">
                    -p 7860:7860 \
                  </p>
                  <p className="text-[#E6EDF3] pl-6">
                    -v /data:/data \
                  </p>
                  <p className="text-[#E6EDF3] pl-6">
                    veterangit/veteran
                  </p>
                  <p className="text-[#3FB950] mt-2">
                    <span className="animate-pulse">&gt;</span> Veteran is running at{' '}
                    <span className="text-[#4493F8] underline underline-offset-2">http://localhost:7860</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 border-t border-[#30363D]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-[#E6EDF3] mb-4"
          >
            Ready to deploy?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#8D96A0] mb-10"
          >
            Join thousands of developers who ship with Veteran. Zero setup, zero cost, zero bullshit.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <VeteranButton
              onClick={() => navigate('/signup')}
              size="lg"
              className="!bg-[#E8B84B] !text-[#0D1117] hover:!bg-[#E8B84B]/90 !font-semibold !px-8"
            >
              Get Started &mdash; it&apos;s free
              <ArrowRight className="w-5 h-5" />
            </VeteranButton>
            <VeteranButton
              onClick={() => navigate('/explore')}
              size="lg"
              variant="outline"
              className="!border-[#30363D] !text-[#E6EDF3] hover:!bg-[#1C2128] !px-8"
            >
              Explore repositories
              <ChevronRight className="w-5 h-5" />
            </VeteranButton>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-[#30363D] py-16 bg-[#0D1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8B84B] to-[#E8B84B]/60 flex items-center justify-center">
                  <GitFork className="w-4 h-4 text-[#0D1117]" />
                </div>
                <span className="font-bold text-lg text-[#E6EDF3]">VETERAN</span>
              </Link>
              <p className="text-sm text-[#8D96A0] leading-relaxed max-w-xs">
                The self-hosted, open-source Git platform built for teams who ship.
              </p>
            </div>
            {['Product', 'Resources', 'Company'].map((section) => (
              <div key={section}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#484F58] mb-4">{section}</h4>
                <ul className="space-y-3">
                  {footerLinks.slice(0, 3).map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-[#8D96A0] hover:text-[#E6EDF3] transition-colors flex items-center gap-2"
                      >
                        <link.icon className="w-3.5 h-3.5" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#484F58] mb-4">Connect</h4>
              <ul className="space-y-3">
                {footerLinks.slice(3).map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#8D96A0] hover:text-[#E6EDF3] transition-colors flex items-center gap-2"
                    >
                      <link.icon className="w-3.5 h-3.5" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-[#21262D] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#484F58]">
              &copy; {new Date().getFullYear()} VETERAN. Built by developers. For developers. No VC money. No bullshit.
            </p>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="text-xs text-[#484F58] hover:text-[#8D96A0] transition-colors">Privacy</a>
              <a href="/terms" className="text-xs text-[#484F58] hover:text-[#8D96A0] transition-colors">Terms</a>
              <a href="/license" className="text-xs text-[#484F58] hover:text-[#8D96A0] transition-colors">License</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
