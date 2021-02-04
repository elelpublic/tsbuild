"use strict";
// unit test for use with bee builder
exports.__esModule = true;
exports.run = void 0;
function run() {
    var testRun = new TestRun("Demo");
    testRun.getLog().setLogSuccesses(true);
    testRun.setup(function () {
        //
    });
    testRun.test("demo1", function () {
        testRun.assertTrue("demo1", false);
    });
    testRun.logSummary();
}
exports.run = run;
