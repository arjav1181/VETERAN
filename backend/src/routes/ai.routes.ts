import { Router, Request, Response, NextFunction } from "express";
import { aiService } from "../services/ai/ai.service.js";

const router = Router();

router.post("/chat", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages, options } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ message: "messages array is required", code: "VALIDATION_ERROR" });
      return;
    }
    const result = await aiService.chat(messages, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/complete", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, options } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ message: "prompt string is required", code: "VALIDATION_ERROR" });
      return;
    }
    const result = await aiService.complete(prompt, options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/review", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, language } = req.body;
    if (!code || typeof code !== "string") {
      res.status(400).json({ message: "code string is required", code: "VALIDATION_ERROR" });
      return;
    }
    const result = await aiService.reviewCode(code, language || "plaintext");
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/status", (_req: Request, res: Response) => {
  res.json(aiService.getStatus());
});

export default router;
