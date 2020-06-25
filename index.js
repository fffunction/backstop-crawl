#!/usr/bin/env node

'use strict';

const meow = require('meow');
const validurl = require('valid-url').is_web_uri;
const updateNotifier = require('update-notifier');
const crawl = require('./lib/crawl');
const pkg = require('./package.json');

// Check for updates every 12 hours
updateNotifier({
    pkg,
    updateCheckInterval: 1000 * 60 * 60 * 12,
}).notify();

const cli = meow(
    `
    Usage
      $ backstop-crawl <url>

    Options
      --outfile, -o        Save the backstop config to this file
      --debug              Logs out errors produced while crawling
      --ignore-robots      Ignore the sites robots.txt
      --ignore-ssl-errors  Treat any certificate as valid (e.g. self-signed
                            or expired)
      --allow-subdomains   Allow crawling links found to subdomains of the
                            current domain
      --limit-similar[=3]  Limits the number of similar URLs to a set number
                           Defaults to 3
                            e.g /blog/1, /blog/2, /blog/3
      --reference-url  Allows a reference URL to be used in testing
      --strip-querystring  Strips the query string from pages
      --max-depth          Maximum depth to crawl

    Examples
      $ backstop-crawl http://localhost
`,
    {
        alias: {
            o: 'outfile',
        },
    }
);

if (cli.flags.limitSimilar) {
    if (!Number.isInteger(cli.flags.limitSimilar)) {
        // Set default if true
        cli.flags.limitSimilar = 3;
    }
}

if (cli.flags.maxDepth) {
    if (!Number.isInteger(cli.flags.maxDepth)) {
        console.error(
            `> Error: "${cli.flags.maxDepth}" isn't a valid depth`
        );
        process.exit(1);
    }
}

if (cli.flags.referenceUrl) {

    if (!validurl(cli.flags.referenceUrl)) {
        console.error(
            `> Error: "${cli.flags.referenceUrl}" isn't a valid reference URL`
        );
        process.exit(1);
    }
}

if (cli.input.length > 0) {
    if (validurl(cli.input[0])) {
        crawl(cli.input[0], cli.flags);
    } else {
        console.error(`> Error: "${cli.input[0]}" isn't a valid URL`);
        process.exit(1);
    }
} else {
    cli.showHelp();
}
