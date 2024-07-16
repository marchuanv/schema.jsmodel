import { basename } from 'node:path';
/**
 * @param { String } filePath
*/
export function getPathSegments(filePath) {
    const baseName = basename(filePath);
    let pathSegments = filePath.split('/');
    let lastElementIndex = pathSegments.length - 1;
    let lastElement = pathSegments[lastElementIndex];
    if (lastElement !== baseName) {
        pathSegments = filePath.split('\\');
        lastElementIndex = pathSegments.length - 1;
        lastElement = pathSegments[lastElementIndex];
    }
    if (lastElement !== baseName) {
        throw new Error(`invalid file path: ${filePath}`);
    }
    return pathSegments;
};