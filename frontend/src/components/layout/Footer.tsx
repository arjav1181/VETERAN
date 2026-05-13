import { Link } from 'react-router-dom';
import { GitFork } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-surface-200 dark:border-surface-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <GitFork className="w-5 h-5 text-veteran-500" />
              <span className="font-bold text-sm">VETERAN</span>
            </div>
            <p className="text-xs text-surface-500 leading-relaxed">
              The veteran-owned Git platform for mission-critical code. Built for those who serve.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">Features</Link></li>
              <li><Link to="/pricing" className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">Pricing</Link></li>
              <li><Link to="/docs" className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">Documentation</Link></li>
              <li><Link to="/changelog" className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">Changelog</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-3">Community</h4>
            <ul className="space-y-2">
              <li><Link to="/explore" className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">Explore</Link></li>
              <li><Link to="/blog" className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">Blog</Link></li>
              <li><Link to="/forum" className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">Forum</Link></li>
              <li><a href="https://github.com/veteran" target="_blank" rel="noopener noreferrer" className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">GitHub</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">Privacy</Link></li>
              <li><Link to="/terms" className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">Terms</Link></li>
              <li><Link to="/security" className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">Security</Link></li>
              <li><Link to="/cookies" className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-400">
            &copy; {new Date().getFullYear()} VETERAN. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-surface-400">
            <span>Status</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
