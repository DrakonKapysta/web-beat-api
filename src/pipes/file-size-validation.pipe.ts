import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
	transform(value: unknown, metadata: ArgumentMetadata): Express.Multer.File {
		const tenMbInBytes = 10 * 1024 * 1024; // 10 MB in bytes
		if (!value) {
			throw new BadRequestException('File is required');
		}

		if (
			!value ||
			typeof value !== 'object' ||
			!('size' in value) ||
			typeof value.size !== 'number'
		) {
			throw new BadRequestException('File is required and must have a size');
		}

		if (value.size > tenMbInBytes) {
			throw new BadRequestException('File size exceeds the maximum limit of 10 MB');
		}

		return value as Express.Multer.File;
	}
}
