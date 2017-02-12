import test from 'ava';
import limitSimilar from '../lib/limit-similar';

const toObj = url => ({
    url,
});

const input = [
    '/',
    '/about/',
    '/blog/',
    '/blog/1/',
    '/blog/2/',
    '/blog/3/',
    '/portfolio/1/',
    '/portfolio/2/',
    '/portfolio/3/',
    '/blog/topic/1.html',
    '/blog/topic/2.html',
    '/blog/topic/3.html',
    '/blog/category/1.html',
    '/blog/category/2.html',
    '/blog/category/3.html',
].map(toObj);


test('return one similar url', async (t) => {
    const expected = [
        '/',
        '/about/',
        '/blog/',
        '/blog/1/',
        '/portfolio/1/',
        '/blog/topic/1.html',
        '/blog/category/1.html',
    ].map(toObj);
    const actual = limitSimilar(input, 1);
    t.deepEqual(expected, actual);
});

test('return two similar urls', async (t) => {
    const expected = [
        '/',
        '/about/',
        '/blog/',
        '/blog/1/',
        '/blog/2/',
        '/portfolio/1/',
        '/portfolio/2/',
        '/blog/topic/1.html',
        '/blog/topic/2.html',
        '/blog/category/1.html',
        '/blog/category/2.html',
    ].map(toObj);
    const actual = limitSimilar(input, 2);
    t.deepEqual(expected, actual);
});


test('return three similar urls', async (t) => {
    const expected = [
        '/',
        '/about/',
        '/blog/',
        '/blog/1/',
        '/blog/2/',
        '/blog/3/',
        '/portfolio/1/',
        '/portfolio/2/',
        '/portfolio/3/',
        '/blog/topic/1.html',
        '/blog/topic/2.html',
        '/blog/topic/3.html',
        '/blog/category/1.html',
        '/blog/category/2.html',
        '/blog/category/3.html',
    ].map(toObj);
    const actual = limitSimilar(input, 3);
    t.deepEqual(expected, actual);
});
