import { Injectable, NotFoundException } from '@nestjs/common';
import { createReadStream, existsSync, mkdirSync, statSync, unlink, writeFile } from 'fs-extra';
import * as path from 'path';
import * as appRoot from 'app-root-path';
import { lookup } from 'mime-types';
import { Response } from 'express';

@Injectable()
export class FileService {
	private readonly uploadPath = path.resolve(appRoot.path, 'uploads/music');

	constructor() {
		if (!existsSync(this.uploadPath)) {
			mkdirSync(this.uploadPath, { recursive: true });
		}
	}
	async saveFile(fileName: string, buffer: Buffer): Promise<string> {
		const filePath = path.join(this.uploadPath, fileName);
		await writeFile(filePath, buffer);
		return filePath;
	}

	async streamFile(fileName: string, res: Response): Promise<void> {
		const filePath = path.join(this.uploadPath, fileName);

		if (!existsSync(filePath)) {
			res.status(404).send('File not found');
			return;
		}

		const stat = statSync(filePath);
		const fileSize = stat.size;
		const mimeType = lookup(filePath) || 'application/octet-stream';

		const range = res.req.headers.range;
		if (range) {
			const parts = range.replace(/bytes=/, '').split('-');
			const start = parseInt(parts[0], 10);
			const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

			const chunkSize = end - start + 1;
			const fileStream = createReadStream(filePath, { start, end });

			res.writeHead(206, {
				'Content-Range': `bytes ${start}-${end}/${fileSize}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': chunkSize,
				'Content-Type': mimeType,
			});

			fileStream.pipe(res);
		} else {
			res.writeHead(200, {
				'Content-Length': fileSize,
				'Content-Type': mimeType,
				'Content-Disposition': `inline; filename="${fileName}"`,
			});

			createReadStream(filePath).pipe(res);
		}
	}

	async deleteFile(fileName: string): Promise<string> {
		const filePath = path.join(this.uploadPath, fileName);
		if (existsSync(filePath)) {
			await unlink(filePath);
			return `File ${fileName} deleted successfully.`;
		}
		return `File ${fileName} not found.`;
	}
}
