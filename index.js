#!/usr/bin/env node

'use strict';

const meow = require('meow');
const validurl = require('valid-url').is_web_uri;
const crawl = require('./lib/crawl');

const cli = meow(`
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

    Examples
      $ backstop-crawl http://localhost
`,
    {
        alias: {
            o: 'outfile',
        },
    });

if (cli.flags.limitSimilar) {
    if (!Number.isInteger(cli.flags.limitSimilar)) {
        // Set default if true
        cli.flags.limitSimilar = 3;
    }
}

if (cli.input.length) {
    if (validurl(cli.input[0])) {
        crawl(cli.input[0], cli.flags);
    } else {
        console.error(`> Error: "${cli.input[0]}" isn't a valid URL`);
        process.exit(1);
    }
} else {
    cli.showHelp();
}
