import { createBrowserRouter, Navigate } from 'react-router-dom';
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />,
  },
  {
    path: '/verify-email/:token',
    element: <VerifyEmail />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'explore', element: <Explore /> },
      { path: 'explore/topics/:topic', element: <Explore /> },
      { path: 'new', element: <CreateRepo /> },
      { path: 'import', element: <ImportRepo /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'codespaces', element: <CodespacesPage /> },
      { path: 'settings', element: <UserSettings /> },
      { path: 'organizations/new', element: <CreateRepo /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'admin/users', element: <AdminUsers /> },
      { path: 'admin/repos', element: <AdminRepos /> },
      { path: 'admin/orgs', element: <AdminOrgs /> },
      { path: 'admin/settings', element: <AdminSettings /> },
      { path: 'admin/audit-log', element: <AdminAuditLog /> },
      { path: 'admin/monitoring', element: <AdminMonitoring /> },
      { path: ':username', element: <UserProfile /> },
      {
        path: ':org',
        element: <OrgProfile />,
      },
      {
        path: ':org/settings',
        element: <OrgSettings />,
      },
      {
        path: ':owner/:repo',
        element: <RepoCode />,
      },
      {
        path: ':owner/:repo/tree/:branch/*',
        element: <RepoCode />,
      },
      {
        path: ':owner/:repo/blob/:branch/*',
        element: <RepoCode />,
      },
      {
        path: ':owner/:repo/commits',
        element: <RepoCommits />,
      },
      {
        path: ':owner/:repo/commits/:branch',
        element: <RepoCommits />,
      },
      {
        path: ':owner/:repo/commit/:sha',
        element: <RepoCommitDetail />,
      },
      {
        path: ':owner/:repo/branches',
        element: <RepoBranches />,
      },
      {
        path: ':owner/:repo/tags',
        element: <RepoBranches />,
      },
      {
        path: ':owner/:repo/releases',
        element: <RepoReleases />,
      },
      {
        path: ':owner/:repo/releases/tag/:tag',
        element: <RepoReleaseDetail />,
      },
      {
        path: ':owner/:repo/releases/new',
        element: <RepoReleaseDetail />,
      },
      {
        path: ':owner/:repo/issues',
        element: <RepoIssues />,
      },
      {
        path: ':owner/:repo/issues/new',
        element: <CreateIssue />,
      },
      {
        path: ':owner/:repo/issues/:number',
        element: <RepoIssueDetail />,
      },
      {
        path: ':owner/:repo/pulls',
        element: <RepoPulls />,
      },
      {
        path: ':owner/:repo/pulls/new',
        element: <CreatePR />,
      },
      {
        path: ':owner/:repo/pull/:number',
        element: <RepoPullDetail />,
      },
      {
        path: ':owner/:repo/pull/:number/files',
        element: <RepoPullDetail />,
      },
      {
        path: ':owner/:repo/pull/:number/commits',
        element: <RepoPullDetail />,
      },
      {
        path: ':owner/:repo/actions',
        element: <RepoActions />,
      },
      {
        path: ':owner/:repo/actions/workflows/:name',
        element: <RepoActions />,
      },
      {
        path: ':owner/:repo/actions/runs/:id',
        element: <RepoActionDetail />,
      },
      {
        path: ':owner/:repo/actions/runs/:id/jobs/:jobId',
        element: <RepoActionDetail />,
      },
      {
        path: ':owner/:repo/projects',
        element: <RepoProjects />,
      },
      {
        path: ':owner/:repo/projects/:id',
        element: <RepoProjectDetail />,
      },
      {
        path: ':owner/:repo/wiki',
        element: <RepoWiki />,
      },
      {
        path: ':owner/:repo/wiki/:page',
        element: <RepoWikiPage />,
      },
      {
        path: ':owner/:repo/discussions',
        element: <RepoDiscussions />,
      },
      {
        path: ':owner/:repo/discussions/:number',
        element: <RepoDiscussionDetail />,
      },
      {
        path: ':owner/:repo/security',
        element: <RepoSecurity />,
      },
      {
        path: ':owner/:repo/security/advisories',
        element: <RepoSecurity />,
      },
      {
        path: ':owner/:repo/insights',
        element: <RepoInsights />,
      },
      {
        path: ':owner/:repo/insights/pulse',
        element: <RepoInsights />,
      },
      {
        path: ':owner/:repo/insights/contributors',
        element: <RepoInsights />,
      },
      {
        path: ':owner/:repo/insights/traffic',
        element: <RepoInsights />,
      },
      {
        path: ':owner/:repo/insights/commits',
        element: <RepoInsights />,
      },
      {
        path: ':owner/:repo/insights/code-frequency',
        element: <RepoInsights />,
      },
      {
        path: ':owner/:repo/packages',
        element: <RepoPackages />,
      },
      {
        path: ':owner/:repo/settings',
        element: <RepoSettings />,
      },
      {
        path: ':owner/:repo/compare',
        element: <RepoPulls />,
      },
      {
        path: ':owner/:repo/compare/:base...:compare',
        element: <RepoPulls />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
