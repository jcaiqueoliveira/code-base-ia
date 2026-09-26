import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ts from "typescript";

const SCRIPT_EXTENSIONS = [".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"];
const TOOL_DIRECTIVES = [/^\/\/\s*biome-ignore/, /^\/\/\s*@ts-expect-error/];
const SQL_STATEMENT_BREAKPOINT = "--> statement-breakpoint";
const SHEBANG = "#!";

const git = (args) => execFileSync("git", args, { encoding: "utf8" });

const workingTree = {
	list: () => git(["ls-files", "--cached", "--others", "--exclude-standard"]),
	read: (path) => readFileSync(path, "utf8"),
};

const revision = (rev) => ({
	list: () => git(["ls-tree", "-r", "--name-only", rev]),
	read: (path) => git(["show", `${rev}:./${path}`]),
});

function sourceFromArgs(args) {
	const revIndex = args.indexOf("--rev");
	if (revIndex === -1) return workingTree;
	return revision(args[revIndex + 1]);
}

function commentRangesOf(sourceFile) {
	const text = sourceFile.getFullText();
	const ranges = new Map();
	const collect = (node) => {
		const leading = ts.getLeadingCommentRanges(text, node.getFullStart()) ?? [];
		const trailing = ts.getTrailingCommentRanges(text, node.getEnd()) ?? [];
		for (const range of [...leading, ...trailing]) ranges.set(range.pos, range);
		for (const child of node.getChildren(sourceFile)) collect(child);
	};
	collect(sourceFile);
	return [...ranges.values()];
}

function scriptComments(path, text) {
	const sourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest);
	return commentRangesOf(sourceFile)
		.map((range) => ({
			line: sourceFile.getLineAndCharacterOfPosition(range.pos).line + 1,
			text: text.slice(range.pos, range.end),
		}))
		.filter((comment) => !TOOL_DIRECTIVES.some((d) => d.test(comment.text)));
}

function lineComments(text, isComment) {
	return text
		.split("\n")
		.map((line, index) => ({ line: index + 1, text: line.trim() }))
		.filter((entry) => isComment(entry));
}

const isShellComment = (entry) =>
	entry.text.startsWith("#") &&
	!(entry.line === 1 && entry.text.startsWith(SHEBANG));

const isSqlComment = (entry) =>
	entry.text.startsWith("--") && entry.text !== SQL_STATEMENT_BREAKPOINT;

function commentsIn(path, text) {
	if (SCRIPT_EXTENSIONS.some((extension) => path.endsWith(extension))) {
		return scriptComments(path, text);
	}
	if (path.endsWith(".sh")) return lineComments(text, isShellComment);
	if (path.endsWith(".sql")) return lineComments(text, isSqlComment);
	return [];
}

const source = sourceFromArgs(process.argv.slice(2));
const paths = source.list().split("\n").filter(Boolean);
const violations = paths.flatMap((path) =>
	commentsIn(path, source.read(path)).map(
		(comment) => `${path}:${comment.line}  ${comment.text.split("\n")[0]}`,
	),
);

if (violations.length > 0) {
	console.error(`Comments are not allowed in code (${violations.length}):`);
	for (const violation of violations) console.error(`  ${violation}`);
	console.error(
		"Say it with a name, a type or a test. The why goes in the commit message.",
	);
	process.exit(1);
}
