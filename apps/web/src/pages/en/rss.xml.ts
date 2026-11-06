import type { APIContext } from "astro";
import { rssDe } from "../../lib/rss";

export const GET = (context: APIContext) => rssDe("en", context);
