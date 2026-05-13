import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VeteranButton } from '@ui/VeteranButton';
import {
  GitForkHorizontal,
  Shield,
  Zap,
  Users,
  Code2,
  Lock,
  ArrowRight,
  Star,
  GitBranch,
  GitPullRequest,
  Bug,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Mission-Ready Security',
    description: 'Enterprise-grade security with end-to-end encryption, SSO, and compliance certifications.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized infrastructure deployed globally for sub-second response times.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Built for teams with code review, project management, and real-time collaboration.',
  },
  {
    icon: Code2,
    title: 'Advanced Code Insights',
    description: 'AI-powered code analysis, security scanning, and performance insights.',
  },
  {
    icon: GitBranch,
    title: 'Branch Protection',
    description: 'Granular branch policies, required reviews, and status checks.',
  },
  {
    icon: Lock,
    title: 'Private by Default',
    description: 'Your code stays yours. Private repositories with no hidden access.',
  },
];

const stats = [
  { label: 'Active Users', value: '10K+' },
  { label: 'Repositories', value: '50K+' },
  { label: 'Deployments', value: '1M+' },
  { label: 'Countries', value: '30+' },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-surface-200 dark:border-surface-700 bg-[rgb(var(--veteran-bg))]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-veteran-500 to-brand-500 flex items-center justify-center">
                <GitForkHorizontal className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl">VETERAN</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 transition-colors">
                Sign in
              </Link>
              <VeteranButton onClick={() => navigate('/signup')} size="sm">
                Get Started
              </VeteranButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-veteran-500/5 via-transparent to-brand-500/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-veteran-100 dark:bg-veteran-900/30 text-veteran-700 dark:text-veteran-400 mb-6">
                <Star className="w-3 h-3" />
                Veteran-Owned & Operated
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-bold tracking-tight text-[rgb(var(--veteran-fg))]"
            >
              Code with{' '}
              <span className="text-gradient">Purpose</span>
              <br />
              Deploy with Confidence
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg text-surface-500 max-w-xl mx-auto"
            >
              The Git platform built for mission-critical code. Enterprise security, veteran values, and the tools you need to ship faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex items-center justify-center gap-4"
            >
              <VeteranButton size="xl" onClick={() => navigate('/signup')}>
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </VeteranButton>
              <VeteranButton size="xl" variant="secondary" onClick={() => navigate('/explore')}>
                Explore
              </VeteranButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-surface-200 dark:border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-[rgb(var(--veteran-fg))]">{stat.value}</div>
                <div className="mt-1 text-sm text-surface-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[rgb(var(--veteran-fg))]">
              Everything you need to ship
            </h2>
            <p className="mt-4 text-lg text-surface-500 max-w-2xl mx-auto">
              From code review to deployment, VETERAN provides the tools your team needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="card-hover p-6"
                >
                  <div className="w-12 h-12 rounded-lg bg-veteran-100 dark:bg-veteran-900/30 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-veteran-600 dark:text-veteran-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--veteran-fg))] mb-2">{feature.title}</h3>
                  <p className="text-sm text-surface-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-veteran-600 to-veteran-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to deploy your next mission?
          </h2>
          <p className="text-lg text-veteran-200 mb-8 max-w-2xl mx-auto">
            Join thousands of developers and teams who trust VETERAN for their critical infrastructure.
          </p>
          <div className="flex items-center justify-center gap-4">
            <VeteranButton
              size="xl"
              variant="gold"
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </VeteranButton>
            <VeteranButton
              size="xl"
              variant="secondary"
              className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
              onClick={() => navigate('/docs')}
            >
              Read Documentation
            </VeteranButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GitForkHorizontal className="w-5 h-5 text-veteran-500" />
              <span className="font-bold text-sm">VETERAN</span>
            </div>
            <p className="text-xs text-surface-400">
              &copy; {new Date().getFullYear()} VETERAN. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
