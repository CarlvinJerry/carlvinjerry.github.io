import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else if (args[key] == null) {
      args[key] = next;
      index += 1;
    } else if (Array.isArray(args[key])) {
      args[key].push(next);
      index += 1;
    } else {
      args[key] = [args[key], next];
      index += 1;
    }
  }
  return args;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function csv(value) {
  if (!value) return [];
  const values = Array.isArray(value) ? value.flatMap((item) => item.split(",")) : value.split(",");
  return values.map((item) => item.trim()).filter(Boolean);
}

function yamlString(value) {
  return JSON.stringify(value);
}

function yamlList(values) {
  return `[${values.map(yamlString).join(", ")}]`;
}

function ensureSection(dir, title, identifier, parent) {
  fs.mkdirSync(dir, { recursive: true });
  const indexPath = path.join(dir, "_index.md");
  if (fs.existsSync(indexPath)) return;

  const parentLine = parent ? `    parent: ${yamlString(parent)}\n` : "";
  const content = `---\ntitle: ${yamlString(title)}\nmenu:\n  sidebar:\n    name: ${yamlString(title)}\n    identifier: ${yamlString(identifier)}\n${parentLine}---\n`;
  fs.writeFileSync(indexPath, content, "utf8");
}

function readBody(sourcePath, title) {
  if (!sourcePath) return "";
  let body = fs.readFileSync(sourcePath, "utf8").replaceAll("\r\n", "\n").trim();

  if (body.startsWith("---\n")) {
    const end = body.indexOf("\n---", 4);
    if (end !== -1) body = body.slice(end + 4).trimStart();
  }

  body = body.replace(new RegExp(`^#\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "u"), "");
  return cleanText(body.trimStart());
}

function cleanText(value) {
  const replacements = new Map([
    ["\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u20ac\u009d", "-"],
    ["\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u20ac\u0153", "-"],
    ["\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u201e\u00a2", "'"],
    ["\u00c3\u00a2\u00e2\u0082\u00ac\u00c5\u201c", "\""],
    ["\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u009d", "\""],
    ["\u00c3\u00a2\u00e2\u0082\u00ac\u00cb\u0153", "'"],
    ["\u00e2\u20ac\u201d", "-"],
    ["\u00e2\u20ac\u201c", "-"],
    ["\u00e2\u20ac\u2122", "'"],
    ["\u00e2\u20ac\u0153", "\""],
    ["\u00e2\u20ac\u009d", "\""],
    ["\u2014", "-"],
    ["\u2013", "-"],
    ["\u2019", "'"],
    ["\u201c", "\""],
    ["\u201d", "\""],
    ["\u2018", "'"],
  ]);

  let result = value;
  for (const [from, to] of replacements) result = result.replaceAll(from, to);
  return result;
}

function copyImage(imagePath, postDir, preferredName) {
  const absolute = path.resolve(imagePath);
  const ext = path.extname(absolute).toLowerCase();
  const fileName = `${preferredName}${ext || ".jpg"}`;
  fs.copyFileSync(absolute, path.join(postDir, fileName));
  return fileName;
}

function required(args, key) {
  if (!args[key]) throw new Error(`Missing required --${key}`);
  return args[key];
}

const args = parseArgs(process.argv.slice(2));
const title = required(args, "title");
const sectionTitle = required(args, "section");
const date = required(args, "date");
const description = required(args, "description");
const summary = required(args, "summary");
const categories = csv(required(args, "categories"));
const tags = csv(required(args, "tags"));

const sectionSlug = args["section-slug"] || slugify(sectionTitle);
const subcategoryTitle = args.subcategory;
const subcategorySlug = subcategoryTitle ? (args["subcategory-slug"] || slugify(subcategoryTitle)) : null;
const postSlug = args.slug || slugify(title);
const author = args.author || "Carlvin Jerry";
const canonical = args.canonical;
const cover = args.cover;
const images = csv(args.images);

const sectionDir = path.join(repoRoot, "content", "posts", sectionSlug);
ensureSection(sectionDir, sectionTitle, sectionSlug);

let parentIdentifier = sectionSlug;
let parentDir = sectionDir;
if (subcategoryTitle) {
  parentDir = path.join(sectionDir, subcategorySlug);
  ensureSection(parentDir, subcategoryTitle, subcategorySlug, sectionSlug);
  parentIdentifier = subcategorySlug;
}

const postDir = path.join(parentDir, postSlug);
fs.mkdirSync(postDir, { recursive: true });
const postPath = path.join(postDir, "index.md");
if (fs.existsSync(postPath)) {
  throw new Error(`${path.relative(repoRoot, postPath).replaceAll(path.sep, "/")} already exists`);
}

let coverFile = "";
if (cover) coverFile = copyImage(cover, postDir, "cover");
for (const image of images) {
  const parsed = path.parse(image);
  copyImage(image, postDir, slugify(parsed.name) || "image");
}

const body = readBody(args.source, title);
const canonicalLine = canonical ? `canonical: ${yamlString(canonical)}\n` : "";
const imageLines = coverFile ? `image: ${coverFile}\nhero: ${coverFile}\n` : "";
const originalNote = canonical ? `> Originally published at [${canonical}](${canonical}).\n\n` : "";

const frontMatter = `---\ntitle: ${yamlString(title)}\ndate: ${date}\nauthor: ${yamlString(author)}\ndescription: ${yamlString(description)}\nsummary: ${yamlString(summary)}\ncategories: ${yamlList(categories)}\ntags: ${yamlList(tags)}\n${imageLines}${canonicalLine}menu:\n  sidebar:\n    name: ${yamlString(title)}\n    identifier: ${yamlString(postSlug)}\n    parent: ${yamlString(parentIdentifier)}\n---\n\n`;

fs.writeFileSync(postPath, frontMatter + originalNote + body, "utf8");

console.log(`Created ${path.relative(repoRoot, postDir).replaceAll(path.sep, "/")}`);
