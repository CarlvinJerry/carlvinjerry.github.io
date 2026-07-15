import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const repoRoot = process.cwd();
const postsRoot = path.join(repoRoot, "content", "posts");
const markdownExtensions = new Set([".md", ".markdown"]);
const errors = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return markdownExtensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function readFrontMatter(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  if (!content.startsWith("---\n") && !content.startsWith("---\r\n")) {
    errors.push(`${relative(filePath)}: missing front matter block`);
    return null;
  }

  const normalized = content.replaceAll("\r\n", "\n");
  const end = normalized.indexOf("\n---", 4);
  if (end === -1) {
    errors.push(`${relative(filePath)}: front matter block is not closed`);
    return null;
  }

  return normalized.slice(4, end);
}

function findDuplicateTopLevelKeys(frontMatter, filePath) {
  const seen = new Map();
  for (const [index, line] of frontMatter.split("\n").entries()) {
    const match = line.match(/^([A-Za-z0-9_-]+):/);
    if (!match) continue;

    const key = match[1];
    if (seen.has(key)) {
      errors.push(
        `${relative(filePath)}:${index + 2}: duplicate front matter key "${key}" first defined on line ${seen.get(key)}`
      );
    } else {
      seen.set(key, index + 2);
    }
  }
}

function parseFrontMatter(frontMatter, filePath) {
  const doc = YAML.parseDocument(frontMatter, { uniqueKeys: true });
  if (doc.errors.length > 0) {
    for (const error of doc.errors) {
      errors.push(`${relative(filePath)}: ${error.message}`);
    }
    return null;
  }

  return doc.toJSON();
}

function assertText(value, field, filePath) {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${relative(filePath)}: "${field}" must be a non-empty string`);
  }
}

function assertStringList(value, field, filePath) {
  if (value == null) return;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    errors.push(`${relative(filePath)}: "${field}" must be a list of non-empty strings`);
  }
}

function assertDate(value, filePath) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return;
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) return;
  errors.push(`${relative(filePath)}: "date" must be a valid date`);
}

function assertRelativeAssetExists(value, field, filePath) {
  if (typeof value !== "string" || value.trim().length === 0) return;
  if (/^(https?:)?\/\//.test(value) || value.startsWith("/")) return;

  const assetPath = path.resolve(path.dirname(filePath), value);
  if (!fs.existsSync(assetPath)) {
    errors.push(`${relative(filePath)}: "${field}" points to missing file "${value}"`);
  }
}

function isArticle(filePath) {
  const name = path.basename(filePath).toLowerCase();
  return name === "index.md" || name === "index.markdown";
}

for (const filePath of walk(postsRoot)) {
  const frontMatter = readFrontMatter(filePath);
  if (!frontMatter) continue;

  findDuplicateTopLevelKeys(frontMatter, filePath);
  const data = parseFrontMatter(frontMatter, filePath);
  if (!data) continue;

  assertText(data.title, "title", filePath);
  assertStringList(data.tags, "tags", filePath);
  assertStringList(data.categories, "categories", filePath);
  assertRelativeAssetExists(data.hero, "hero", filePath);
  assertRelativeAssetExists(data.image, "image", filePath);

  if (isArticle(filePath)) {
    assertDate(data.date, filePath);
    assertText(data.description, "description", filePath);
  }
}

if (errors.length > 0) {
  console.error("Blog post checks failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Blog post checks passed.");
