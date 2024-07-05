/**
 * Copyright (C) <2023> <Boundivore> <boundivore@foxmail.com>
 * <p>
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the Apache License, Version 2.0
 * as published by the Apache Software Foundation.
 * <p>
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * Apache License, Version 2.0 for more details.
 * <p>
 * You should have received a copy of the Apache License, Version 2.0
 * along with this program; if not, you can obtain a copy at
 * http://www.apache.org/licenses/LICENSE-2.0.
 */
/**
 * MarkdownViewer- markdown格式展示
 * @author Tracy
 */
import React, { useEffect, useState } from 'react';
import { marked } from 'marked';

interface MarkdownViewerProps {
	markdown: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdown }) => {
	const [htmlContent, setHtmlContent] = useState<string | Promise<string>>('');

	useEffect(() => {
		const renderer = new marked.Renderer();
		marked.setOptions({
			renderer: renderer,
			gfm: true,
			breaks: true,
			pedantic: false
		});

		const html = marked.parse(markdown);
		setHtmlContent(html);
	}, [markdown]);

	return <div className="text-start" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default MarkdownViewer;
