type PythonFormatOptions = {
	line_length?: number;
	indent_style?: "space" | "tab";
	indent_size?: number;
};

const repeat = (ch: string, count: number) => new Array(count + 1).join(ch);

export const formatPython = async (code: string, options?: PythonFormatOptions): Promise<string> => {
	const lineLength = options?.line_length ?? 88;
	const indentStyle = options?.indent_style ?? "space";
	const indentSize = options?.indent_size ?? 4;

	// Normalize EOLs
	let text = code.replace(/\r\n?/g, "\n");

	// Trim trailing whitespace per line
	let lines = text.split("\n").map((l) => l.replace(/[\t ]+$/g, ""));

	// Collapse excessive blank lines (max 2 consecutive)
	const collapsed: string[] = [];
	let blankRun = 0;
	for (const l of lines) {
		if (l.trim() === "") {
			blankRun += 1;
			if (blankRun <= 2) collapsed.push("");
			continue;
		}
		blankRun = 0;
		collapsed.push(l);
	}
	lines = collapsed;

	// Ensure spaces around operators and after commas (basic)
	lines = lines.map((l) => {
		let out = l;
		// Skip inside strings by a quick heuristic: only operate outside quotes pairs
		// This is simplistic; good enough for baseline formatting.
		if (/["']/g.test(out)) return out;
		out = out.replace(/\s*,\s*/g, ", ");
		out = out.replace(/\s*([+\-*/%]|==|!=|<=|>=|<|>|:=)\s*/g, " $1 ");
		out = out.replace(/\s*([=])\s*/g, " $1 ");
		out = out.replace(/\s*:\s*$/g, ":");
		return out;
	});

	// Normalize indentation (do not change block structure; just convert style)
	lines = lines.map((l) => {
		const leadingTabs = l.match(/^[\t ]*/)?.[0] ?? "";
		const content = l.slice(leadingTabs.length);
		let level = 0;
		for (const ch of leadingTabs) level += ch === "\t" ? indentSize : 1;
		const unit = indentStyle === "tab" ? "\t" : repeat(" ", indentSize);
		const rebuilt = unit.repeat(Math.floor(level / indentSize)) + repeat(" ", level % indentSize) + content;
		return rebuilt;
	});

	// Soft-wrap overly long lines at nearest space before the limit (simple)
	const wrapped: string[] = [];
	for (let l of lines) {
		while (l.length > lineLength) {
			let cut = l.lastIndexOf(" ", lineLength);
			if (cut <= 0) break;
			wrapped.push(l.slice(0, cut));
			l = (indentStyle === "tab" ? "\t" : repeat(" ", indentSize)) + l.slice(cut + 1);
		}
		wrapped.push(l);
	}

	let result = wrapped.join("\n");
	if (!result.endsWith("\n")) result += "\n";
	return result;
};