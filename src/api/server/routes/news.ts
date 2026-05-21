import type { RouteDef } from "../../schema";
import { getNews } from "../../upstream/news";

export const newsRoutes: RouteDef[] = [
  {
    path: "/api/news",
    params: ["category"],
    defaults: { category: "official" },
    handler: (category) => getNews(category),
  },
];
