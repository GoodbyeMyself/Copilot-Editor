type JavaScriptFormatOptions = {
    line_length?: number;
    indent_style?: "space" | "tab";
    indent_size?: number;
    semicolons?: boolean;
    single_quotes?: boolean;
    trailing_comma?: boolean;
};

const repeat = (ch: string, count: number) => new Array(count + 1).join(ch);

export const formatJavaScript = async (code: string, options?: JavaScriptFormatOptions): Promise<string> => {
    const lineLength = options?.line_length ?? 100;
    const indentStyle = options?.indent_style ?? "space";
    const indentSize = options?.indent_size ?? 2;
    const semicolons = options?.semicolons ?? true;
    const singleQuotes = options?.single_quotes ?? false;
    const trailingComma = options?.trailing_comma ?? true;

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

    // Basic formatting rules
    lines = lines.map((l) => {
        let out = l;
        
        // Skip formatting inside strings and comments
        if (/["'`]/.test(out) || out.trim().startsWith("//") || out.trim().startsWith("/*")) {
            return out;
        }

        // Add spaces around operators
        out = out.replace(/\s*([+\-*/%=<>!&|^]|==|!=|===|!==|<=|>=|&&|\|\||<<|>>|>>>)\s*/g, " $1 ");
        
        // Fix double spaces from operator formatting
        out = out.replace(/\s+/g, " ");
        
        // Spaces after commas
        out = out.replace(/,(?!\s)/g, ", ");
        
        // Spaces after semicolons (in for loops)
        out = out.replace(/;(?!\s|$)/g, "; ");
        
        // Remove spaces before semicolons
        out = out.replace(/\s+;/g, ";");
        
        // Spaces around object/array brackets
        out = out.replace(/\{\s*/g, "{ ");
        out = out.replace(/\s*\}/g, " }");
        out = out.replace(/\[\s*/g, "[");
        out = out.replace(/\s*\]/g, "]");
        
        // Function formatting
        out = out.replace(/function\s*\(/g, "function (");
        out = out.replace(/\)\s*\{/g, ") {");
        
        // Arrow function formatting
        out = out.replace(/=>\s*\{/g, "=> {");
        out = out.replace(/\)\s*=>/g, ") =>");
        
        // Control structure formatting
        out = out.replace(/\b(if|for|while|switch|catch)\s*\(/g, "$1 (");
        out = out.replace(/\}\s*(else|catch|finally)\s*\{/g, "} $1 {");
        out = out.replace(/\}\s*else\s+if\s*\(/g, "} else if (");
        
        return out;
    });

    // Normalize indentation
    lines = lines.map((l) => {
        const leadingWhitespace = l.match(/^[\t ]*/)?.[0] ?? "";
        const content = l.slice(leadingWhitespace.length);
        
        if (content === "") return "";
        
        let level = 0;
        for (const ch of leadingWhitespace) {
            level += ch === "\t" ? indentSize : 1;
        }
        
        const unit = indentStyle === "tab" ? "\t" : repeat(" ", indentSize);
        const normalizedIndent = unit.repeat(Math.floor(level / indentSize)) + repeat(" ", level % indentSize);
        
        return normalizedIndent + content;
    });

    // Handle semicolon preferences
    if (semicolons) {
        lines = lines.map((l) => {
            const trimmed = l.trim();
            if (trimmed === "" || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
                return l;
            }
            
            // Add semicolons to statements that need them
            if (
                !trimmed.endsWith(";") &&
                !trimmed.endsWith("{") &&
                !trimmed.endsWith("}") &&
                !trimmed.endsWith(",") &&
                !trimmed.includes("//") &&
                !trimmed.includes("/*") &&
                !/^\s*(if|else|for|while|switch|try|catch|finally|function|class)\b/.test(trimmed) &&
                !/^\s*\}/.test(trimmed) &&
                trimmed.length > 0
            ) {
                return l + ";";
            }
            return l;
        });
    } else {
        // Remove unnecessary semicolons
        lines = lines.map((l) => {
            if (l.trim().endsWith(";") && !l.includes("for (")) {
                return l.replace(/;\s*$/, "");
            }
            return l;
        });
    }

    // Handle quote preferences
    if (singleQuotes) {
        lines = lines.map((l) => {
            // Simple replacement - in a real formatter, this would need more sophisticated string parsing
            return l.replace(/"/g, "'");
        });
    }

    // Basic line length handling (very simple)
    const wrapped: string[] = [];
    for (let l of lines) {
        if (l.length > lineLength && l.includes(",") && !l.trim().startsWith("//")) {
            // Try to break at commas
            const indent = l.match(/^[\t ]*/)?.[0] ?? "";
            const parts = l.split(",");
            if (parts.length > 1) {
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i].trim();
                    if (i === 0) {
                        wrapped.push(indent + part + (i < parts.length - 1 ? "," : ""));
                    } else if (i === parts.length - 1) {
                        wrapped.push(indent + "  " + part);
                    } else {
                        wrapped.push(indent + "  " + part + ",");
                    }
                }
                continue;
            }
        }
        wrapped.push(l);
    }

    let result = wrapped.join("\n");
    
    // Ensure file ends with newline
    if (!result.endsWith("\n")) {
        result += "\n";
    }
    
    return result;
};