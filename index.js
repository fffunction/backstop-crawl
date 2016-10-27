#!/usr/bin/env node

'use strict';

const meow = require('meow');
const validurl = require('valid-url').is_web_uri;
const crawl = require('./lib/crawl');

const cli = meow(`
    Usage
      $ backstop-crawl <url>

    Options
      --ignore-robots, -i  Ignore the sites robots.txt
      --outfile, -o        Save the backstop config to this file

    Examples
      $ backstop-crawl http://localhost
`, {
    alias: {
        i: 'ignore-robots',
        o: 'outfile',
    },
});

if (cli.input.length) {
    if (validurl(cli.input[0])) {
        crawl(cli.input[0], cli.flags);
    } else {
        console.error(`Error: "${cli.input[0]}" isn't a valid URL`);
        process.exit(1);
    }
} else {
  cli.showHelp();
}
