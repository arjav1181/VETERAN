import prisma from "../../config/database.js";
import { env } from "../../config/env.js";
import { generateToken, generateOAuthState } from "../../utils/crypto.js";
import { tokenService } from "./token.service.js";
import { AppError } from "../../middleware/errorHandler.js";

interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface OAuthProvider {
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
}

export class OAuthService {
  private providers: Map<string, OAuthProvider> = new Map();

  constructor() {
    if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
      this.providers.set("github", {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        authorizeUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",
        userInfoUrl: "https://api.github.com/user",
        scopes: ["user:email", "read:user"],
      });
    }

    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
      this.providers.set("google", {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
        scopes: ["email", "profile"],
      });
    }

    if (env.GITLAB_CLIENT_ID && env.GITLAB_CLIENT_SECRET) {
      this.providers.set("gitlab", {
        clientId: env.GITLAB_CLIENT_ID,
        clientSecret: env.GITLAB_CLIENT_SECRET,
        authorizeUrl: "https://gitlab.com/oauth/authorize",
        tokenUrl: "https://gitlab.com/oauth/token",
        userInfoUrl: "https://gitlab.com/api/v4/user",
        scopes: ["read_user", "email"],
      });
    }
  }

  getAuthorizationUrl(provider: string, redirectUri: string): string {
    const config = this.providers.get(provider);
    if (!config) {
      throw new AppError(`Unsupported OAuth provider: ${provider}`, 400, "INVALID_PROVIDER");
    }

    const state = generateOAuthState();
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: config.scopes.join(" "),
      state,
      response_type: "code",
    });

    return `${config.authorizeUrl}?${params.toString()}`;
  }

  async handleCallback(provider: string, code: string, redirectUri: string): Promise<{
    user: { id: string; username: string; email: string };
    accessToken: string;
    refreshToken: string;
  }> {
    const config = this.providers.get(provider);
    if (!config) {
      throw new AppError(`Unsupported OAuth provider: ${provider}`, 400, "INVALID_PROVIDER");
    }

    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new AppError("Failed to exchange OAuth code", 400, "OAUTH_FAILED");
    }

    const tokenData = (await tokenResponse.json()) as Record<string, unknown>;
    const accessToken = tokenData.access_token as string;

    const userResponse = await fetch(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!userResponse.ok) {
      throw new AppError("Failed to fetch user info", 400, "OAUTH_FAILED");
    }

    const rawProfile = (await userResponse.json()) as Record<string, unknown>;
    const profile: OAuthProfile = await this.mapProfile(provider, rawProfile);

    let oauthAccount = await prisma.oAuthAccount.findUnique({
      where: { provider_providerId: { provider: profile.provider, providerId: profile.providerId } },
      include: { user: true },
    });

    if (oauthAccount) {
      if (!oauthAccount.user.isActive) {
        throw new AppError("Account is inactive", 403, "ACCOUNT_INACTIVE");
      }

      await prisma.oAuthAccount.update({
        where: { id: oauthAccount.id },
        data: { email: profile.email, name: profile.name, avatarUrl: profile.avatarUrl },
      });

      const tokens = await tokenService.generateTokens(oauthAccount.userId);
      return {
        user: { id: oauthAccount.user.id, username: oauthAccount.user.username, email: oauthAccount.user.email },
        ...tokens,
      };
    }

    let user = await prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      const username = await this.generateUniqueUsername(profile.email.split("@")[0]);
      user = await prisma.user.create({
        data: {
          username,
          email: profile.email,
          displayName: profile.name,
          avatarUrl: profile.avatarUrl,
          isEmailVerified: true,
        },
      });
    }

    await prisma.oAuthAccount.create({
      data: {
        userId: user.id,
        provider: profile.provider,
        providerId: profile.providerId,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      },
    });

    const tokens = await tokenService.generateTokens(user.id);
    return {
      user: { id: user.id, username: user.username, email: user.email },
      ...tokens,
    };
  }

  private async mapProfile(provider: string, raw: Record<string, unknown>): Promise<OAuthProfile> {
    switch (provider) {
      case "github":
        return {
          provider: "github",
          providerId: String(raw.id),
          email: String(raw.email || (raw as Record<string, unknown>).login + "@github.com"),
          name: String(raw.name || raw.login || ""),
          avatarUrl: String(raw.avatar_url || ""),
        };
      case "google":
        return {
          provider: "google",
          providerId: String(raw.id),
          email: String(raw.email),
          name: String(raw.name || ""),
          avatarUrl: String(raw.picture || ""),
        };
      case "gitlab":
        return {
          provider: "gitlab",
          providerId: String(raw.id),
          email: String(raw.email || ""),
          name: String(raw.name || raw.username || ""),
          avatarUrl: String(raw.avatar_url || ""),
        };
      default:
        throw new AppError(`Unknown provider: ${provider}`, 400, "INVALID_PROVIDER");
    }
  }

  private async generateUniqueUsername(base: string): Promise<string> {
    let username = base.replace(/[^a-z0-9-]/gi, "").toLowerCase().slice(0, 39);
    if (username.length < 2) username = `user${username}`;

    let exists = await prisma.user.findUnique({ where: { username } });
    let counter = 1;

    while (exists) {
      const suffix = counter.toString();
      const newUsername = `${username.slice(0, 39 - suffix.length - 1)}-${suffix}`;
      exists = await prisma.user.findUnique({ where: { username: newUsername } });
      username = newUsername;
      counter++;
    }

    return username;
  }

  getSupportedProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  isProviderSupported(provider: string): boolean {
    return this.providers.has(provider);
  }
}

export const oauthService = new OAuthService();
