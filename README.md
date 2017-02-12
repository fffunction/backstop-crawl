# $ backstop-crawl
[![Stories in Ready](https://badge.waffle.io/fffunction/backstop-crawl.svg?label=ready&title=Ready)](http://waffle.io/fffunction/backstop-crawl) [![Build Status](https://travis-ci.org/fffunction/backstop-crawl.svg?branch=master)](https://travis-ci.org/fffunction/backstop-crawl) [![Coverage Status](https://coveralls.io/repos/github/fffunction/backstop-crawl/badge.svg?branch=master)](https://coveralls.io/github/fffunction/backstop-crawl?branch=master)

> `backstop-crawl` is a tool for automatically generating the `backstop.json` required for [`backstop`](https://github.com/garris/BackstopJS) by crawling a website.

![](http://i.imgur.com/yv57RDo.gif)

## Install

```
$ npm install --global backstop-crawl
```

## Usage

```
❯ backstop-crawl

  Crawl a site to generate a backstopjs config

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

```


## License

MIT © fffunction [fffunction.co](https://fffunction.co)
