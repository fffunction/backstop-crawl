module.exports = processOverrides;
function processOverrides(urls, scenarios) {

    scenarios.forEach((scenario, scenarioKey) => {
        urls.forEach((url, urlKey) => {
            if (url.label === scenario.label) {
                urls[urlKey] = scenarios[scenarioKey];
            }
        });
    });

    return urls;
}
