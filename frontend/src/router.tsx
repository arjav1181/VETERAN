import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@components/layout/AppShell';
import { Landing } from '@pages/Landing';
import { Login } from '@pages/Login';
import { Signup } from '@pages/Signup';
import { ForgotPassword } from '@pages/ForgotPassword';
import { ResetPassword } from '@pages/ResetPassword';
import { VerifyEmail } from '@pages/VerifyEmail';
import { Dashboard } from '@pages/Dashboard';
import { Explore } from '@pages/Explore';
import { UserProfile } from '@pages/UserProfile';
import { OrgProfile } from '@pages/OrgProfile';
import { OrgSettings } from '@pages/OrgSettings';
import { CreateRepo } from '@pages/CreateRepo';
import { ImportRepo } from '@pages/ImportRepo';
import { RepoCode } from '@pages/RepoCode';
import { RepoCommits } from '@pages/RepoCommits';
import { RepoCommitDetail } from '@pages/RepoCommitDetail';
import { RepoBranches } from '@pages/RepoBranches';
import { RepoReleases } from '@pages/RepoReleases';
import { RepoReleaseDetail } from '@pages/RepoReleaseDetail';
import { RepoIssues } from '@pages/RepoIssues';
import { RepoIssueDetail } from '@pages/RepoIssueDetail';
import { CreateIssue } from '@pages/CreateIssue';
import { RepoPulls } from '@pages/RepoPulls';
import { RepoPullDetail } from '@pages/RepoPullDetail';
import { CreatePR } from '@pages/CreatePR';
import { RepoActions } from '@pages/RepoActions';
import { RepoActionDetail } from '@pages/RepoActionDetail';
import { RepoProjects } from '@pages/RepoProjects';
import { RepoProjectDetail } from '@pages/RepoProjectDetail';
import { RepoWiki } from '@pages/RepoWiki';
import { RepoWikiPage } from '@pages/RepoWikiPage';
import { RepoDiscussions } from '@pages/RepoDiscussions';
import { RepoDiscussionDetail } from '@pages/RepoDiscussionDetail';
import { RepoSecurity } from '@pages/RepoSecurity';
import { RepoInsights } from '@pages/RepoInsights';
import { RepoPackages } from '@pages/RepoPackages';
import { RepoSettings } from '@pages/RepoSettings';
import { NotificationsPage } from '@pages/Notifications';
import { CodespacesPage } from '@pages/Codespaces';
import { UserSettings } from '@pages/UserSettings';
import { AdminDashboard } from '@pages/AdminDashboard';
import { AdminUsers } from '@pages/AdminUsers';
import { AdminRepos } from '@pages/AdminRepos';
import { AdminOrgs } from '@pages/AdminOrgs';
import { AdminSettings } from '@pages/AdminSettings';
import { AdminAuditLog } from '@pages/AdminAuditLog';
import { AdminMonitoring } from '@pages/AdminMonitoring';
import { type ReactNode } from 'react';

function NotFound() {
  return <div className="min-h-screen bg-primary-dark flex items-center justify-center text-text-secondary">404 - Page not found</div>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="verify-email/:token" element={<VerifyEmail />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="explore" element={<Explore />} />
        <Route path="explore/topics/:topic" element={<Explore />} />
        <Route path="new" element={<CreateRepo />} />
        <Route path="import" element={<ImportRepo />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="codespaces" element={<CodespacesPage />} />
        <Route path="settings" element={<UserSettings />} />
        <Route path="organizations/new" element={<CreateRepo />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/users" element={<AdminUsers />} />
        <Route path="admin/repos" element={<AdminRepos />} />
        <Route path="admin/orgs" element={<AdminOrgs />} />
        <Route path="admin/settings" element={<AdminSettings />} />
        <Route path="admin/audit-log" element={<AdminAuditLog />} />
        <Route path="admin/monitoring" element={<AdminMonitoring />} />
        <Route path=":username" element={<UserProfile />} />
        <Route path=":org" element={<OrgProfile />} />
        <Route path=":org/settings" element={<OrgSettings />} />
        <Route path=":owner/:repo" element={<RepoCode />} />
        <Route path=":owner/:repo/tree/:branch/*" element={<RepoCode />} />
        <Route path=":owner/:repo/blob/:branch/*" element={<RepoCode />} />
        <Route path=":owner/:repo/commits" element={<RepoCommits />} />
        <Route path=":owner/:repo/commits/:branch" element={<RepoCommits />} />
        <Route path=":owner/:repo/commit/:sha" element={<RepoCommitDetail />} />
        <Route path=":owner/:repo/branches" element={<RepoBranches />} />
        <Route path=":owner/:repo/tags" element={<RepoBranches />} />
        <Route path=":owner/:repo/releases" element={<RepoReleases />} />
        <Route path=":owner/:repo/releases/tag/:tag" element={<RepoReleaseDetail />} />
        <Route path=":owner/:repo/releases/new" element={<RepoReleaseDetail />} />
        <Route path=":owner/:repo/issues" element={<RepoIssues />} />
        <Route path=":owner/:repo/issues/new" element={<CreateIssue />} />
        <Route path=":owner/:repo/issues/:number" element={<RepoIssueDetail />} />
        <Route path=":owner/:repo/pulls" element={<RepoPulls />} />
        <Route path=":owner/:repo/pulls/new" element={<CreatePR />} />
        <Route path=":owner/:repo/pull/:number" element={<RepoPullDetail />} />
        <Route path=":owner/:repo/pull/:number/files" element={<RepoPullDetail />} />
        <Route path=":owner/:repo/pull/:number/commits" element={<RepoPullDetail />} />
        <Route path=":owner/:repo/actions" element={<RepoActions />} />
        <Route path=":owner/:repo/actions/workflows/:repo" element={<RepoActions />} />
        <Route path=":owner/:repo/actions/runs/:id" element={<RepoActionDetail />} />
        <Route path=":owner/:repo/actions/runs/:id/jobs/:jobId" element={<RepoActionDetail />} />
        <Route path=":owner/:repo/projects" element={<RepoProjects />} />
        <Route path=":owner/:repo/projects/:id" element={<RepoProjectDetail />} />
        <Route path=":owner/:repo/wiki" element={<RepoWiki />} />
        <Route path=":owner/:repo/wiki/:page" element={<RepoWikiPage />} />
        <Route path=":owner/:repo/discussions" element={<RepoDiscussions />} />
        <Route path=":owner/:repo/discussions/:number" element={<RepoDiscussionDetail />} />
        <Route path=":owner/:repo/security" element={<RepoSecurity />} />
        <Route path=":owner/:repo/security/advisories" element={<RepoSecurity />} />
        <Route path=":owner/:repo/insights" element={<RepoInsights />} />
        <Route path=":owner/:repo/insights/pulse" element={<RepoInsights />} />
        <Route path=":owner/:repo/insights/contributors" element={<RepoInsights />} />
        <Route path=":owner/:repo/insights/traffic" element={<RepoInsights />} />
        <Route path=":owner/:repo/insights/commits" element={<RepoInsights />} />
        <Route path=":owner/:repo/insights/code-frequency" element={<RepoInsights />} />
        <Route path=":owner/:repo/packages" element={<RepoPackages />} />
        <Route path=":owner/:repo/settings" element={<RepoSettings />} />
        <Route path=":owner/:repo/compare" element={<RepoPulls />} />
        <Route path=":owner/:repo/compare/:base...:compare" element={<RepoPulls />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export function RouterProvider() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
