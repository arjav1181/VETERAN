import { Request, Response, NextFunction } from "express";
import { PAGINATION_DEFAULT_PER_PAGE, PAGINATION_MAX_PER_PAGE } from "../config/constants.js";

declare global {
  namespace Express {
    interface Request {
      pagination: {
        page: number;
        perPage: number;
        offset: number;
        cursor?: string;
        direction: "forward" | "backward";
      };
    }
  }
}

export function paginationMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const perPage = Math.min(
    PAGINATION_MAX_PER_PAGE,
    Math.max(1, parseInt(req.query.per_page as string) || PAGINATION_DEFAULT_PER_PAGE)
  );
  const cursor = req.query.cursor as string | undefined;
  const direction = (req.query.direction as "forward" | "backward") || "forward";

  req.pagination = {
    page,
    perPage,
    offset: (page - 1) * perPage,
    cursor,
    direction,
  };

  next();
}

export function setPaginationHeaders(res: Response, total: number, page: number, perPage: number): void {
  const totalPages = Math.ceil(total / perPage);
  res.set("X-Total-Count", String(total));
  res.set("X-Total-Pages", String(totalPages));
  res.set("X-Per-Page", String(perPage));
  res.set("X-Page", String(page));

  const links: string[] = [];
  const baseUrl = res.req?.originalUrl?.split("?")[0] || "";

  if (page > 1) {
    links.push(`<${baseUrl}?page=${page - 1}&per_page=${perPage}>; rel="prev"`);
  }
  if (page < totalPages) {
    links.push(`<${baseUrl}?page=${page + 1}&per_page=${perPage}>; rel="next"`);
  }
  if (totalPages > 0) {
    links.push(`<${baseUrl}?page=1&per_page=${perPage}>; rel="first"`);
    links.push(`<${baseUrl}?page=${totalPages}&per_page=${perPage}>; rel="last"`);
  }

  if (links.length > 0) {
    res.set("Link", links.join(", "));
  }
}
