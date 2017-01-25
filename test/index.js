import fs from 'fs';
import test from 'ava';
import liveServer from 'live-server';
import execa from 'execa';
import pify from 'pify';
import pathExists from 'path-exists';

const readfile = pify(fs.readFile);

test.before(() => {
    process.chdir('test');
    const params = {
        port: 8080, // Set the server port. Defaults to 8080.
        host: '0.0.0.0', // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
        root: './fixtures/site', // Set root directory that's being served. Defaults to cwd.
        open: false, // When false, it won't load your browser by default.
        logLevel: 0, // 0 = errors only, 1 = some, 2 = lots
    };
    liveServer.start(params);
    if (!pathExists.sync('./fixtures/not-writeable')) {
        fs.writeFileSync('./fixtures/not-writeable', 'This is not writeable');
        fs.chmodSync('./fixtures/not-writeable', 0);
    }
});

test('Show help on no input', async (t) => {
    const { stdout } = await execa('../index.js');
    t.truthy(stdout.includes(`$ backstop-crawl <url>`));
});

test('Failed on invalid URL', async (t) => {
    const { stderr } = await execa('../index.js', ['not a url'], { reject: false });
    t.truthy(stderr.replace(/\\|\n/, '') === `Error: "not a url" isn't a valid URL`);
});

test('Default usage', async (t) => {
    await execa('../index.js', ['http://0.0.0.0:8080']);
    const [file, expected] = await Promise.all([
        readfile('./backstop.json'),
        readfile('./fixtures/default-test.json'),
    ])
    .then(files => files.map(f => JSON.parse(f.toString())));
    return t.deepEqual(file, expected);
});

test('Allow crawling subdomains', async (t) => {
    await execa('../index.js', ['https://badssl.com/', '--allow-subdomains', '--outfile=allow-subdomains.json']);
    const [file, expected] = await Promise.all([
        readfile('./allow-subdomains.json'),
        readfile('./fixtures/allow-subdomains.json'),
    ])
    .then(files => files.map(f => JSON.parse(f.toString())));
    return t.deepEqual(file, expected);
});

test('Ignore SSL errors', async (t) => {
    await execa('../index.js', ['https://badssl.com/', '--ignore-ssl-errors', '--allow-subdomains', '--outfile=ignore-ssl-errors.json']);
    const [file, expected] = await Promise.all([
        readfile('./ignore-ssl-errors.json'),
        readfile('./fixtures/ignore-ssl-errors.json'),
    ])
    .then(files => files.map(f => JSON.parse(f.toString())));
    return t.deepEqual(file, expected);
});

test('Ignored robots.txt', async (t) => {
    await execa('../index.js', ['http://0.0.0.0:8080', '--ignore-robots', '--outfile=ignore-robots.json']);
    const [file, expected] = await Promise.all([
        readfile('./ignore-robots.json'),
        readfile('./fixtures/ignore-robots.json'),
    ])
    .then(files => files.map(f => JSON.parse(f.toString())));
    return t.deepEqual(file, expected);
});

test('Custom outfile', async (t) => {
    await execa('../index.js', ['http://0.0.0.0:8080', '--outfile=custom/out/file.json']);
    const [file, expected] = await Promise.all([
        readfile('./custom/out/file.json'),
        readfile('./fixtures/default-test.json'),
    ])
    .then(files => files.map(f => JSON.parse(f.toString())));
    return t.deepEqual(file, expected);
});

test('mkpath errors nicely', async (t) => {
    const { stderr } = await execa('../index.js', ['http://0.0.0.0:8080', '--outfile=fixtures/file-exists/backstop.json']);
    t.truthy(stderr.includes('fixtures/file-exists exists and is not a directory'));
});

test('jsonfile errors nicely', async (t) => {
    const { stderr } = await execa('../index.js', ['http://0.0.0.0:8080', '--outfile=fixtures/not-writeable']);
    t.truthy(stderr.includes(`✖ Error: EACCES: permission denied, open 'fixtures/not-writeable'`));
});

test('Debug flag produces crawl errors', async (t) => {
    const { stderr } = await execa('../index.js', ['https://expired.badssl.com/', '--debug', '--outfile=fixtures/debug.json']);
    t.truthy(stderr.includes(`✖ Error: certificate has expired`));
});
