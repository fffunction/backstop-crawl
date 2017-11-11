/* eslint camelcase:0 */
module.exports = {
    viewports: [
	{
		name: "phone",
		width: 320,
		height: 480
	  },
	  {
		name: "tablet_v",
		width: 568,
		height: 1024
	  },
	  {
		name: "tablet_h",
		width: 1024,
		height: 768
	  },
	  {
		name: "desktop",
		width: 1920,
		height: 1080
	  },
    ],
    scenarios: [],
    paths: {
	bitmaps_reference: "backstop_data/bitmaps_reference",
	bitmaps_test: "backstop_data/bitmaps_test",
	compare_data: "backstop_data/bitmaps_test/compare.json",
	casper_scripts: "backstop_data/casper_scripts",	
    },
    casperFlags: [],
    engine: 'chrome',
    report: ['CI'],
    debug: false,
    port: 3001,
};
