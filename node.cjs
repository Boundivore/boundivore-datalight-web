const fs = require('fs');
const path = require('path');

// 指定文件夹路径
const folderPath = 'src'; // 请根据实际项目结构调整

// 添加的注释
const comment = `/**
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
*/`;

// 遍历文件夹
function traverseFolder(folderPath) {
	const files = fs.readdirSync(folderPath);
	files.forEach(file => {
		const filePath = path.join(folderPath, file);
		const stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			traverseFolder(filePath);
		} else if (stats.isFile() && file.endsWith('.tsx')) {
			// 只处理 JS 文件
			addCommentToFile(filePath, comment);
		}
	});
}

// 添加注释到文件
function addCommentToFile(filePath, comment) {
	try {
		let content = fs.readFileSync(filePath, 'utf-8');

		// 检查是否已经存在相同注释，避免重复添加
		if (!content.includes(comment)) {
			// 在文件开头添加注释
			content = comment + content;

			// 写回文件
			fs.writeFileSync(filePath, content, 'utf-8');
			console.log(`Comment added to ${filePath}`);
		} else {
			console.log(`Comment already exists in ${filePath}`);
		}
	} catch (error) {
		console.error(`Error adding comment to ${filePath}: ${error.message}`);
	}
}

// 开始遍历文件夹并添加注释
traverseFolder(folderPath);
