import fs from 'fs';
import path from 'path';
import test from 'ava';
import liveServer from 'live-server';
import execa from 'execa';
import pify from 'pify';
import pathExists from 'path-exists';

const readfile = pify(fs.readFile);
const dir = p => path.join(__dirname, p.join());

test.before(() => {
    const params = {
        port: 8080, // Set the server port. Defaults to 8080.
        host: '0.0.0.0', // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
        root: './fixtures/site', // Set root directory that's being served. Defaults to cwd.
        open: false, // When false, it won't load your browser by default.
        logLevel: 0, // 0 = errors only, 1 = some, 2 = lots
    };
    liveServer.start(params);
    if (!pathExists.sync(dir`fixtures/not-writeable`)) {
        fs.writeFileSync(dir`fixtures/not-writeable`, 'This is not writeable');
        fs.chmodSync(dir`fixtures/not-writeable`, 0);
    }
});

test('Show help on no input', async (t) => {
    const { stdout } = await execa(dir`../index.js`);
    t.truthy(stdout.includes(`$ backstop-crawl <url>`));
});

test('Failed on invalid URL', async (t) => {
    const { stderr } = await execa(dir`../index.js`, ['not a url'], { reject: false });
    t.truthy(stderr.replace(/\\|\n/, '') === `Error: "not a url" isn't a valid URL`);
});

test('Default usage', async (t) => {
    await execa(dir`../index.js`, ['http://0.0.0.0:8080']);
    const [file, expected] = await Promise.all([
        readfile(dir`backstop.json`),
        readfile(dir`fixtures/default-test.json`),
    ]);
    return t.deepEqual(JSON.parse(file.toString()), JSON.parse(expected.toString()));
});

test('Ignored robots.txt', async (t) => {
    await execa(dir`../index.js`, ['http://0.0.0.0:8080', '--ignore-robots', '--outfile=ignore-robots.json']);
    const [file, expected] = await Promise.all([
        readfile(dir`ignore-robots.json`),
        readfile(dir`fixtures/ignore-robots.json`),
    ]);
    return t.deepEqual(JSON.parse(file.toString()), JSON.parse(expected.toString()));
});

test('Custom outfile', async (t) => {
    await execa(dir`../index.js`, ['http://0.0.0.0:8080', '--outfile=custom/out/file.json']);
    const [file, expected] = await Promise.all([
        readfile(dir`custom/out/file.json`),
        readfile(dir`fixtures/default-test.json`),
    ]);
    return t.deepEqual(JSON.parse(file.toString()), JSON.parse(expected.toString()));
});

test('mkpath errors nicely', async (t) => {
    const { stderr } = await execa(dir`../index.js`, ['http://0.0.0.0:8080', `--outfile=${dir`fixtures/file-exists/backstop.json`}`]);
    t.truthy(stderr.includes('fixtures/file-exists exists and is not a directory'));
});

test('jsonfile errors nicely', async (t) => {
    const { stderr } = await execa(dir`../index.js`, ['http://0.0.0.0:8080', `--outfile=${dir`fixtures/not-writeable`}`]);
    t.truthy(stderr === `✖ Error: EACCES: permission denied, open '${dir`fixtures/not-writeable`}'`);
});
