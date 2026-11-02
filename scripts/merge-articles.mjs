import { readdir, readFile, writeFile } from "node:fs/promises";

const articlesDir = new URL("../articles/", import.meta.url);
const outputFile = new URL("../items.json", import.meta.url);

const files = (await readdir(articlesDir))
  .filter((file) => file.endsWith(".json"))
  .sort();

const items = [];

for (const file of files) {
  const raw = await readFile(new URL(file, articlesDir), "utf8");
  let article;

  try {
    article = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${file}: invalid JSON (${error.message})`);
  }

  const valid =
    article !== null &&
    typeof article === "object" &&
    typeof article.title === "string" &&
    typeof article.link === "string" &&
    Array.isArray(article.categories) &&
    article.categories.every((category) => typeof category === "string");

  if (!valid) {
    throw new Error(
      `${file}: expected title (string), link (string), and categories (string[])`
    );
  }

  items.push({
    title: article.title,
    link: article.link,
    categories: article.categories,
  });
}

await writeFile(outputFile, `${JSON.stringify(items)}\n`);
console.log(`Wrote ${items.length} items to items.json`);
