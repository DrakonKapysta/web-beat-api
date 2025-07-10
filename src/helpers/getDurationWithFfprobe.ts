import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getDurationWithFfprobe(filePath: string): Promise<number | null> {
	try {
		const { stdout } = await execAsync(
			`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
		);
		return parseFloat(stdout.trim());
	} catch (error) {
		console.error('ffprobe error:', error);
		return null;
	}
}
