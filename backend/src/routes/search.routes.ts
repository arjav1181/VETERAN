import { Router, Request, Response, NextFunction } from "express";
import { searchService } from "../services/search.service.js";
import { searchRateLimit } from "../middleware/rateLimit.js";
import { paginationMiddleware, setPaginationHeaders } from "../middleware/pagination.js";

const router = Router();

router.get("/repositories", searchRateLimit, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.json({ items: [], total: 0 });

    const result = await searchService.searchRepositories(query, req.pagination.page, req.pagination.perPage);
    setPaginationHeaders(res, result.total, result.page, result.perPage);
    res.json({ items: result.items, total_count: result.total, incomplete_results: false });
  } catch (error) {
    next(error);
  }
});

router.get("/issues", searchRateLimit, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.json({ items: [], total: 0 });

    const result = await searchService.searchIssues(query, req.pagination.page, req.pagination.perPage);
    setPaginationHeaders(res, result.total, result.page, result.perPage);
    res.json({ items: result.items, total_count: result.total, incomplete_results: false });
  } catch (error) {
    next(error);
  }
});

router.get("/commits", searchRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ items: [], total_count: 0, incomplete_results: false });
  } catch (error) {
    next(error);
  }
});

router.get("/code", searchRateLimit, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ items: [], total_count: 0, incomplete_results: false });
  } catch (error) {
    next(error);
  }
});

router.get("/users", searchRateLimit, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.json({ items: [], total: 0 });

    const result = await searchService.searchUsers(query, req.pagination.page, req.pagination.perPage);
    setPaginationHeaders(res, result.total, result.page, result.perPage);
    res.json({ items: result.items, total_count: result.total, incomplete_results: false });
  } catch (error) {
    next(error);
  }
});

router.get("/topics", searchRateLimit, paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.json({ items: [], total: 0 });

    const result = await searchService.searchTopics(query, req.pagination.page, req.pagination.perPage);
    setPaginationHeaders(res, result.total, result.page, result.perPage);
    res.json({ items: result.items, total_count: result.total, incomplete_results: false });
  } catch (error) {
    next(error);
  }
});

export default router;
