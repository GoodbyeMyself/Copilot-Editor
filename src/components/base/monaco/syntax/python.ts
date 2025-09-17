/* eslint-disable no-useless-escape */
import type { languages } from "monaco-editor";

export const pythonConf: languages.LanguageConfiguration = {
  comments: {
    lineComment: "#",
    blockComment: ["'''", "'''"],
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: "'''", close: "'''" },
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  indentationRules: {
    increaseIndentPattern: /^\s*(def|class|if|elif|else|for|while|try|except|finally|with|async def|async for|async with).*:\s*$/,
    decreaseIndentPattern: /^\s*(elif|else|except|finally).*:\s*$/,
  },
};

export const pythonDef: languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      // 字符串
      [/""".*?"""/, "string"],
      [/'''.*?'''/, "string"],
      [/".*?"/, "string"],
      [/'.*?'/, "string"],
      
      // 注释
      [/#.*$/, "comment"],
      
      // 数字
      [/\d*\.\d+([eE][\-+]?\d+)?[fFdD]?/, "number.float"],
      [/0[xX][0-9a-fA-F]+[Ll]?/, "number.hex"],
      [/0[0-7]+[Ll]?/, "number.octal"],
      [/\d+[lL]?/, "number"],
      
      // 关键字
      [/\b(and|as|assert|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|not|or|pass|print|raise|return|try|while|with|yield)\b/, "keyword"],
      
      // 内置函数和类型
      [/\b(abs|all|any|bin|bool|chr|dict|dir|divmod|enumerate|eval|exec|filter|float|format|frozenset|getattr|hasattr|hash|help|hex|id|input|int|isinstance|issubclass|iter|len|list|locals|map|max|min|next|object|oct|open|ord|pow|print|property|range|repr|reversed|round|set|setattr|slice|sorted|str|sum|super|tuple|type|vars|zip|__import__)\b/, "support.function"],
      
      // 内置类型
      [/\b(True|False|None|self|cls)\b/, "constant.language"],
      
      // 标识符
      [/[a-zA-Z_$][a-zA-Z0-9_$]*/, "identifier"],
      
      // 操作符
      [/[+\-*/%=<>!&|^~]/, "operator"],
      [/[{}()\[\]]/, "bracket"],
      [/[;,.]/, "delimiter"],
    ],
  },
};