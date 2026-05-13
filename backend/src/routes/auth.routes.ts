import { Router, Request, Response, NextFunction } from "express";
import { authService } from "../services/auth/auth.service.js";
import { oauthService } from "../services/auth/oauth.service.js";
import { tokenService } from "../services/auth/token.service.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { authRateLimit } from "../middleware/rateLimit.js";

const router = Router();

router.post("/register", authRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body, req.ip);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/login", authRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { login, password } = req.body;
    const result = await authService.login(login, password, req.ip);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/logout", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.body.sessionId;
    await authService.logout(sessionId, req.user!.id);
    res.json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await tokenService.refreshAccessToken(refreshToken, req.ip, req.headers["user-agent"]);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserProfile(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.updateProfile(req.user!.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post("/change-password", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.id, currentPassword, newPassword);
    res.json({ message: "Password changed" });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", authRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.requestPasswordReset(req.body.email);
    res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    next(error);
  }
});

router.post("/reset-password", authRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
});

router.post("/verify-email", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.verifyEmail(req.user!.id);
    res.json({ message: "Email verified" });
  } catch (error) {
    next(error);
  }
});

router.post("/2fa/enable", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.enable2FA(req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/2fa/verify", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.verify2FA(req.user!.id, req.body.code);
    res.json({ message: "2FA enabled" });
  } catch (error) {
    next(error);
  }
});

router.post("/2fa/disable", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.disable2FA(req.user!.id);
    res.json({ message: "2FA disabled" });
  } catch (error) {
    next(error);
  }
});

router.get("/sessions", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await tokenService.listSessions(req.user!.id);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

router.delete("/sessions/:sessionId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await tokenService.revokeSession(req.params.sessionId, req.user!.id);
    res.json({ message: "Session revoked" });
  } catch (error) {
    next(error);
  }
});

router.get("/tokens", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = await tokenService.listApiTokens(req.user!.id);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

router.post("/tokens", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, scopes, expiresInDays } = req.body;
    const token = await tokenService.createApiToken(req.user!.id, name, scopes || [], expiresInDays);
    res.status(201).json(token);
  } catch (error) {
    next(error);
  }
});

router.delete("/tokens/:tokenId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await tokenService.deleteApiToken(req.params.tokenId, req.user!.id);
    res.json({ message: "Token deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/oauth/providers", (_req: Request, res: Response) => {
  res.json({ providers: oauthService.getSupportedProviders() });
});

router.get("/oauth/:provider/authorize", (req: Request, res: Response) => {
  const { provider } = req.params;
  const redirectUri = req.query.redirect_uri as string || "http://localhost:5173/auth/callback";
  try {
    const url = oauthService.getAuthorizationUrl(provider, redirectUri);
    res.json({ url });
  } catch (error) {
    res.status(400).json({ message: "Unsupported provider" });
  }
});

router.post("/oauth/:provider/callback", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider } = req.params;
    const { code, redirect_uri } = req.body;
    const result = await oauthService.handleCallback(provider, code, redirect_uri);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
