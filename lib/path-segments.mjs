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
/**
 * @param { Array<String> } segmentsA
 * @param { Array<String> } segmentsB
 * @param { Boolean } ignoreCase
*/
export function isMatchingPathSegments(segmentsA, segmentsB, ignoreCase = false) {
    let _segmentsA = ignoreCase ? segmentsA.map(seg => seg.toLowerCase()) : segmentsA;
    let _segmentsB = ignoreCase ? segmentsB.map(seg => seg.toLowerCase()) : segmentsB;
    const _segmentsLength = _segmentsA.length > _segmentsB.length ? _segmentsB.length : _segmentsA.length;
    for (let pos = _segmentsLength; pos > 0; pos--) {
        let index = pos - 1;
        if (_segmentsA[index] === undefined || _segmentsB[index] === undefined || _segmentsA[index] === null || _segmentsB[index] === null) {
            throw new Error('index out of range or segments have invalid items');
        }
        if (_segmentsA[index] !== _segmentsB[index]) {
            return false;
        }
    }
    return true;
};