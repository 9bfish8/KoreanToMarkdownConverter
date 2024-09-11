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
        // HTML을 DOM으로 파싱
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 체크박스 변환 함수
        const convertCheckboxes = (element) => {
            const checkboxLists = element.querySelectorAll('ul[data-checked]');
            checkboxLists.forEach(list => {
                const isChecked = list.getAttribute('data-checked') === 'true';
                const items = list.querySelectorAll('li');
                items.forEach(item => {
                    item.innerHTML = `${isChecked ? '[x]' : '[ ]'} ${item.innerHTML}`;
                });
            });
        };

        // 체크박스 변환 적용
        convertCheckboxes(doc.body);

        // 변환된 HTML을 문자열로 가져옴
        let md = doc.body.innerHTML;

        // 기존의 마크다운 변환 로직 적용
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

        // 연속된 빈 줄 제거
        md = md.replace(/\n\s*\n/g, '\n\n');

        // HTML 엔티티 디코딩
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
                <h1 className="text-5xl font-bold text-center mb-8 text-indigo-800">README 마크다운 에디터</h1>
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                >
                    마크다운 도움말
                </button>
                {showHelp && (
                    <div className="mb-4 p-4 bg-white rounded-lg shadow">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-15rem)]">
                    <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col">
                        <h2 className="text-3xl font-semibold mb-4 text-indigo-700">편집기</h2>
                        <ReactQuill
                            theme="snow"
                            value={editorContent}
                            onChange={handleEditorChange}
                            modules={modules}
                            className="flex-grow"
                            style={{height: 'calc(100% - 3rem)', fontSize: '1.1rem', paddingBottom: '45px'}}
                        />
                    </div>
                    <div className="bg-indigo-50 rounded-xl shadow-2xl p-6 flex flex-col">
                        <h2 className="text-3xl font-semibold mb-4 text-indigo-700">마크다운 결과</h2>
                        <div className="relative flex-grow">
                            <pre className="bg-white p-6 rounded-lg h-full overflow-auto whitespace-pre-wrap border border-indigo-200 text-lg">
                                {markdown}
                            </pre>
                            <button
                                onClick={copyToClipboard}
                                className={`absolute top-4 right-4 px-6 py-3 text-lg font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 ${copied ? 'bg-green-500 hover:bg-green-600' : ''}`}
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