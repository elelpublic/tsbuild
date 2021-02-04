"use strict";
// unit test for use with bee builder
exports.__esModule = true;
var bee_1 = require("../bee");
var testRun = new bee_1.TestRun("Demo");
testRun.getLog().setLogSuccesses(true);
testRun.setup(function () {
    //
});
testRun.test("demo2", function () {
    testRun.assertTrue("demo2", false);
});
testRun.logSummary();
