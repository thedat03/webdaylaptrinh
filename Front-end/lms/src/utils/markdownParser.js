function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

function processInlineMarkdown(text) {
    // Escape HTML first
    let processed = escapeHtml(text);

    // Split by code blocks first to avoid processing inside them
    const codeRegex = /`([^`]+)`/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(processed)) !== null) {
        // Add text before code
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: processed.substring(lastIndex, match.index)
            });
        }
        // Add code block
        parts.push({
            type: 'code',
            content: match[1]
        });
        lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < processed.length) {
        parts.push({
            type: 'text',
            content: processed.substring(lastIndex)
        });
    }

    // Process each part
    processed = parts.map(part => {
        if (part.type === 'code') {
            return `<code class="bg-blue-50 text-blue-900 px-2 py-0.5 rounded text-sm font-mono">${part.content}</code>`;
        }

        let result = part.content;

        // Color text: {color:text} or {red:text}, {blue:text}, etc.
        result = result.replace(/\{red:(.*?)\}/g, '<span class="text-red-600 font-semibold">$1</span>');
        result = result.replace(/\{blue:(.*?)\}/g, '<span class="text-blue-600 font-semibold">$1</span>');
        result = result.replace(/\{green:(.*?)\}/g, '<span class="text-green-600 font-semibold">$1</span>');
        result = result.replace(/\{yellow:(.*?)\}/g, '<span class="text-yellow-600 font-semibold">$1</span>');
        result = result.replace(/\{purple:(.*?)\}/g, '<span class="text-purple-600 font-semibold">$1</span>');
        result = result.replace(/\{orange:(.*?)\}/g, '<span class="text-orange-600 font-semibold">$1</span>');

        // Bold
        result = result.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
        result = result.replace(/\b__(.*?)__\b/g, '<strong class="font-bold text-gray-900">$1</strong>');

        // Italic
        result = result.replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>');
        result = result.replace(/\b_(.*?)_\b/g, '<em class="italic text-gray-600">$1</em>');

        // Links
        result = result.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline">$1</a>'
        );

        return result;
    }).join('');

    return processed;
}

export function parseMarkdownToHTML(text) {
    if (!text) return "";

    const lines = text.split(/\r?\n/);
    let html = "";
    let inList = false;
    let listType = null;
    let inCodeBlock = false;
    let codeBlockContent = "";
    let inSpecialBlock = false;
    let specialBlockType = "";
    let specialBlockContent = "";

    const closeList = () => {
        if (inList) {
            html += listType === "ul" ? "</ul>" : "</ol>";
            inList = false;
            listType = null;
        }
    };

    const closeCodeBlock = () => {
        if (inCodeBlock) {
            let content = codeBlockContent.trim();
            let language = "";
            // Extract language if present
            if (content.startsWith("LANG:")) {
                const langMatch = content.match(/^LANG:(\w+)\n/);
                if (langMatch) {
                    language = langMatch[1];
                    content = content.replace(/^LANG:\w+\n/, "");
                }
            }
            const langClass = language ? `language-${language}` : "";
            const langLabel = language ? `<div class="text-xs text-gray-500 mb-2 font-semibold uppercase">${language}</div>` : "";
            html += `<div class="bg-gray-900 border border-gray-700 rounded-lg my-6 overflow-hidden text-left">
                ${langLabel}
                <pre class="m-0 p-4 overflow-x-auto"><code class="${langClass} text-gray-100 font-mono text-sm leading-relaxed">${escapeHtml(content)}</code></pre>
            </div>`;
            inCodeBlock = false;
            codeBlockContent = "";
        }
    };

    const closeSpecialBlock = () => {
        if (inSpecialBlock) {
            let bgClass = "bg-blue-50 border-l-4 border-blue-400";
            let title = "";
            let titleClass = "text-blue-700 font-bold";

            if (specialBlockType === "INPUT") {
                bgClass = "bg-blue-50 border-l-4 border-blue-400";
                title = "Đầu vào";
                titleClass = "text-blue-700 font-bold";
            } else if (specialBlockType === "OUTPUT") {
                bgClass = "bg-green-50 border-l-4 border-green-400";
                title = "Đầu ra";
                titleClass = "text-green-700 font-bold";
            } else if (specialBlockType === "VÍ DỤ") {
                bgClass = "bg-purple-50 border-l-4 border-purple-400";
                title = "Ví dụ";
                titleClass = "text-purple-700 font-bold";
            } else if (specialBlockType === "ĐẦU VÀO/ĐẦU RA") {
                bgClass = "bg-indigo-50 border-l-4 border-indigo-400";
                title = "Đầu vào/Đầu ra";
                titleClass = "text-indigo-700 font-bold";
            } else if (specialBlockType === "GỢI Ý") {
                bgClass = "bg-yellow-50 border-l-4 border-yellow-400";
                title = "Gợi ý";
                titleClass = "text-yellow-700 font-bold";
            } else if (specialBlockType === "ĐIỀU KIỆN TIỀN ĐỀ") {
                bgClass = "bg-orange-50 border-l-4 border-orange-400";
                title = "Điều kiện tiền đề";
                titleClass = "text-orange-700 font-bold";
            } else {
                bgClass = "bg-gray-50 border-l-4 border-gray-400";
                title = specialBlockType;
                titleClass = "text-gray-700 font-bold";
            }

            const content = processInlineMarkdown(specialBlockContent.trim());
            html += `<div class="${bgClass} p-5 rounded-lg my-6 shadow-sm">
                <div class="${titleClass} text-sm font-semibold mb-3 uppercase tracking-wide">${title}</div>
                <div class="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">${content}</div>
            </div>`;
            inSpecialBlock = false;
            specialBlockType = "";
            specialBlockContent = "";
        }
    };

    lines.forEach((line) => {
        const trimmed = line.trim();

        // Special blocks: [INPUT], [OUTPUT], [CODE], [VÍ DỤ], [ĐẦU VÀO/ĐẦU RA], [GỢI Ý], [ĐIỀU KIỆN TIỀN ĐỀ]
        if (trimmed.match(/^\[(INPUT|OUTPUT|CODE|VÍ DỤ|VÍ DỤ:|ĐẦU VÀO\/ĐẦU RA|ĐẦU VÀO\/ĐẦU RA:|GỢI Ý|GỢI Ý:|ĐIỀU KIỆN TIỀN ĐỀ|ĐIỀU KIỆN TIỀN ĐỀ:)\]/i)) {
            closeList();
            closeCodeBlock();
            if (inSpecialBlock) {
                closeSpecialBlock();
            } else {
                let blockType = trimmed.slice(1, -1).toUpperCase();
                // Normalize Vietnamese labels
                if (blockType.includes("VÍ DỤ")) blockType = "VÍ DỤ";
                else if (blockType.includes("ĐẦU VÀO") || blockType.includes("ĐẦU RA")) blockType = "ĐẦU VÀO/ĐẦU RA";
                else if (blockType.includes("GỢI Ý")) blockType = "GỢI Ý";
                else if (blockType.includes("ĐIỀU KIỆN")) blockType = "ĐIỀU KIỆN TIỀN ĐỀ";
                specialBlockType = blockType;
                inSpecialBlock = true;
            }
            return;
        }

        if (inSpecialBlock) {
            specialBlockContent += line + "\n";
            return;
        }

        closeSpecialBlock();

        // Code blocks with optional language
        if (trimmed.startsWith("```")) {
            if (inCodeBlock) {
                closeCodeBlock();
            } else {
                closeList();
                inCodeBlock = true;
                // Extract language if present (e.g., ```c, ```cpp, ```java)
                const langMatch = trimmed.match(/^```(\w+)?/);
                if (langMatch && langMatch[1]) {
                    codeBlockContent = `LANG:${langMatch[1]}\n`;
                }
            }
            return;
        }

        if (inCodeBlock) {
            codeBlockContent += line + "\n";
            return;
        }

        closeCodeBlock();

        if (!trimmed) {
            closeList();
            if (html && !html.endsWith("<br />")) {
                html += "<br />";
            }
            return;
        }

        // Headings
        if (trimmed.startsWith("# ")) {
            closeList();
            html += `<h1 class="text-3xl font-bold text-gray-900 mt-10 mb-6 leading-tight text-left">${escapeHtml(trimmed.slice(2))}</h1>`;
            return;
        }
        if (trimmed.startsWith("## ")) {
            closeList();
            html += `<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4 leading-tight text-left">${escapeHtml(trimmed.slice(3))}</h2>`;
            return;
        }
        if (trimmed.startsWith("### ")) {
            closeList();
            html += `<h3 class="text-xl font-bold text-gray-800 mt-6 mb-3 leading-tight text-left">${escapeHtml(trimmed.slice(4))}</h3>`;
            return;
        }
        if (trimmed.startsWith("#### ")) {
            closeList();
            html += `<h4 class="text-lg font-bold text-gray-800 mt-5 mb-2 leading-tight text-left">${escapeHtml(trimmed.slice(5))}</h4>`;
            return;
        }

        // Lists
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            if (!inList || listType !== "ul") {
                closeList();
                html += '<ul class="list-disc ml-6 mb-5 space-y-1.5 text-left">';
                inList = true;
                listType = "ul";
            }
            let content = trimmed.slice(2);
            content = processInlineMarkdown(content);
            html += `<li class="leading-7 text-left">${content}</li>`;
            return;
        }

        if (trimmed.match(/^\d+\.\s/)) {
            if (!inList || listType !== "ol") {
                closeList();
                html += '<ol class="list-decimal ml-6 mb-5 space-y-1.5 text-left">';
                inList = true;
                listType = "ol";
            }
            let content = trimmed.replace(/^\d+\.\s/, "");
            content = processInlineMarkdown(content);
            html += `<li class="leading-7 text-left">${content}</li>`;
            return;
        }

        // Images: ![alt](url)
        if (trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)/)) {
            closeList();
            const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
            if (imgMatch) {
                const alt = imgMatch[1] || "";
                let url = imgMatch[2];
                // Handle relative paths
                if (url && !url.startsWith("http") && !url.startsWith("/api/")) {
                    url = `/api/files/${url}`;
                }
                html += `<div class="my-6 text-center"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" class="max-w-full h-auto rounded-lg shadow-lg mx-auto" onerror="this.onerror=null; this.src='/api/files/${escapeHtml(url)}';" /></div>`;
            }
            return;
        }

        // Regular paragraph
        closeList();
        const processed = processInlineMarkdown(trimmed);
        html += `<p class="mb-6 leading-8 text-gray-800 text-left">${processed}</p>`;
    });

    closeList();
    closeCodeBlock();
    closeSpecialBlock();

    return html;
}

