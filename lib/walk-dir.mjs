import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
export function walkDir(dir, callback) {
    if (existsSync(dir)) {
        const files = readdirSync(dir);
        for (const f of files) {
            let dirPath = path.join(dir, f);
            const stat = statSync(dirPath);
            var fileSizeInMegabytes = stat.size / (1024 * 1024);
            let isDirectory = stat.isDirectory();
            if (isDirectory) {
                walkDir(dirPath, callback);
            } else {
                try {
                    callback(path.join(dir, f), dir, fileSizeInMegabytes);
                } catch (error) { console.log(error); }
            }
        };
    }
};