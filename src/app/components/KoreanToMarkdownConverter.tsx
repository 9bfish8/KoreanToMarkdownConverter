// KoreanToMarkdownConverter.tsx
'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import 'quill-table';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const KoreanToMarkdownConverter: React.FC = () => {
    const [editorContent, setEditorContent] = useState('');
    const [markdown, setMarkdown] = useState('');
    const [copied, setCopied] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'list': 'check'}],
            ['link', 'image', 'code-block'],
            [{ 'table': true }],
            ['clean']
        ],
    }), []);

    const convertToMarkdown = (html: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const convertCheckboxes = (element: Element) => {
            const checkboxLists = element.querySelectorAll('ul[data-checked]');
            checkboxLists.forEach(list => {
                const isChecked = list.getAttribute('data-checked') === 'true';
                const items = list.querySelectorAll('li');
                items.forEach(item => {
                    item.innerHTML = `${isChecked ? '[x]' : '[ ]'} ${item.innerHTML}`;
                });
            });
        };

        convertCheckboxes(doc.body);

        let md = doc.body.innerHTML;

        md = md
            .replace(/<h1>/g, '# ').replace(/<\/h1>/g, '\n')
            .replace(/<h2>/g, '## ').replace(/<\/h2>/g, '\n')
            .replace(/<h3>/g, '### ').replace(/<\/h3>/g, '\n')
            .replace(/<strong>/g, '**').replace(/<\/strong>/g, '**')
            .replace(/<em>/g, '*').replace(/<\/em>/g, '*')
            .replace(/<u>/g, '__').replace(/<\/u>/g, '__')
            .replace(/<s>/g, '~~').replace(/<\/s>/g, '~~')
            .replace(/<ul[^>]*>/g, '').replace(/<\/ul>/g, '\n')
            .replace(/<ol[^>]*>/g, '').replace(/<\/ol>/g, '\n')
            .replace(/<li>\[x\]/g, '- [x] ').replace(/<li>\[ \]/g, '- [ ] ')
            .replace(/<li>/g, '- ').replace(/<\/li>/g, '\n')
            .replace(/<p>/g, '').replace(/<\/p>/g, '\n')
            .replace(/<br>/g, '\n')
            .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '```\n$1\n```\n')
            .replace(/<code>/g, '`').replace(/<\/code>/g, '`')
            .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
            .replace(/<img src="(.*?)".*?>/g, '![]($1)')
            .replace(/<table>/g, '\n').replace(/<\/table>/g, '\n')
            .replace(/<tr>/g, '|').replace(/<\/tr>/g, '|\n')
            .replace(/<td>/g, ' ').replace(/<\/td>/g, ' |')
            .replace(/<th>/g, ' ').replace(/<\/th>/g, ' |');

        md = md.replace(/\n\s*\n/g, '\n\n');
        md = md.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

        setMarkdown(md.trim());
    };

    const handleEditorChange = (content: string) => {
        setEditorContent(content);
        convertToMarkdown(content);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(markdown).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 p-4">
            <div className="container mx-auto max-w-full h-full">
                <h1 className="text-3xl md:text-5xl font-bold text-center mb-4 md:mb-8 text-indigo-800">README 마크다운 에디터</h1>
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="w-full md:w-auto mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                >
                    마크다운 도움말
                </button>
                {showHelp && (
                    <div className="mb-4 p-4 bg-white rounded-lg shadow text-sm md:text-base">
                        <h3 className="text-lg font-bold mb-2">마크다운 기본 문법</h3>
                        <ul className="list-disc pl-5">
                            <li># 제목 1</li>
                            <li>## 제목 2</li>
                            <li>**굵은 글씨**</li>
                            <li>*기울임*</li>
                            <li>[링크](URL)</li>
                            <li>![이미지](이미지URL)</li>
                            <li>- 목록</li>
                            <li>1. 번호 목록</li>
                            <li>- [ ] 체크박스</li>
                            <li>`코드`</li>
                            <li>```\n코드 블록\n```</li>
                            <li>| 테이블 | 열 |</li>
                        </ul>
                    </div>
                )}
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 h-[calc(100vh-12rem)] md:h-[calc(100vh-15rem)]">
                    <div className="flex-1 bg-white rounded-xl shadow-2xl p-4 md:p-6 flex flex-col">
                        <h2 className="text-2xl md:text-3xl font-semibold mb-2 md:mb-4 text-indigo-700">편집기</h2>
                        <ReactQuill
                            theme="snow"
                            value={editorContent}
                            onChange={handleEditorChange}
                            modules={modules}
                            className="flex-grow"
                            style={{height: 'calc(100% - 2.5rem)', fontSize: '1rem', paddingBottom: '45px'}}
                        />
                    </div>
                    <div className="flex-1 bg-indigo-50 rounded-xl shadow-2xl p-4 md:p-6 flex flex-col">
                        <h2 className="text-2xl md:text-3xl font-semibold mb-2 md:mb-4 text-indigo-700">마크다운 결과</h2>
                        <div className="relative flex-grow">
                            <pre className="bg-white p-4 md:p-6 rounded-lg h-full overflow-auto whitespace-pre-wrap border border-indigo-200 text-sm md:text-lg">
                                {markdown}
                            </pre>
                            <button
                                onClick={copyToClipboard}
                                className={`absolute top-2 right-2 md:top-4 md:right-4 px-3 py-1 md:px-6 md:py-3 text-sm md:text-lg font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 ${copied ? 'bg-green-500 hover:bg-green-600' : ''}`}
                            >
                                {copied ? '복사됨!' : '복사'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KoreanToMarkdownConverter;