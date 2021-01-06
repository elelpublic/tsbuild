#!/usr/bin/env node
/**
 * --------------------------------------------------------------------------------------
 *
 * Why is this file here?
 *
 * Answer: bee is an antlike build system to perform some necessary tasks in this
 * project. This file contains the complete executable code for bee. Only nodejs is
 * required to run bee.
 *
 * The targets to be achieved in this project are defined in the file:
 *
 * build.js
 *
 * --------------------------------------------------------------------------------------
 */
var t0 = Date.now();
console.log("# ------------------------------------------------------------------------------");
console.log("                                                                _");
console.log("                                                               | |__   ___  ___");
console.log("                                                               | '_ \\ / _ \\/ _ \\");
console.log("                                                               | |_) |  __/  __/");
console.log("                                                               |_.__/ \\___|\\___|");
console.log(" * to build and to serve *                                             bee 0.3.0");
console.log("");
console.log("# ------------------------------------------------------------------------------");
console.log("");
var CommandLine = /** @class */ (function () {
    function CommandLine() {
        this.targets = [];
        this.runDefaultTarget = false;
        this.showAlltargets = false;
        this.nodeps = false;
        this.verbose = false;
        this.listTasks = false;
    }
    return CommandLine;
}());
;
var Project = /** @class */ (function () {
    function Project() {
        this.error = false;
        this.targets = [];
    }
    return Project;
}());
;
// ------------------------------------------------------------
var commandLine = parseCommandLine(process);
var project = loadBuildFile();
if (project.error) {
    usage(project.errorMessage);
}
else {
    if (commandLine.listTasks) {
        listTasks(commandLine.describeTask);
    }
    else {
        if (commandLine.runDefaultTarget) {
            if (!project.defaultTarget) {
                usage("Error: Cannot run default target because no default target is defined.");
            }
            else {
                commandLine.targets.push(project.defaultTarget);
            }
        }
        if (commandLine.targets.length == 0) {
            usage("Please define one or more targets to run or run with option -d");
        }
        else {
            var bee = createRunner();
            var alreadyCalled = {};
            for (var i = 0; i < commandLine.targets.length; i++) {
                var targetName = commandLine.targets[i];
                call(targetName, alreadyCalled, project, bee);
            }
        }
    }
}
console.log("");
console.log("# ------------------------------------------------------------------------------");
console.log("");
console.log("Finished after " + (Date.now() - t0) + " millis.");
console.log("");
// * * * ----------------------------------------------
function call(targetName, alreadyCalled, project, bee) {
    var target = project.targets[targetName];
    if (!target) {
        throw "Error: target '" + targetName + "' not found.";
    }
    else {
        // call dependencies first
        if (target.depends && !commandLine.nodeps) {
            for (var i = 0; i < target.depends.length; i++) {
                var dependencyName = target.depends[i];
                call(dependencyName, alreadyCalled, project, bee);
            }
        }
        if (!alreadyCalled[targetName]) {
            alreadyCalled[targetName] = true;
            var target_1 = project.targets[targetName];
            // call the actual target last
            try {
                log("Performing target: '" + targetName + "'");
                target_1.code(bee);
            }
            catch (error) {
                message("Error in target '" + targetName + "':\n" + error);
            }
        }
    }
}
/**
 * Show a message and the usage information
 *
 * @param messageText Extra message
 *
 */
function usage(messageText) {
    console.log("Usage:");
    console.log("  bee [options] default | [target [target2 [target3]  ..]]");
    console.log("");
    console.log("Runs the given targets or the default target if no target is given.");
    console.log("");
    console.log("Options:");
    console.log("  -f <file> .......... load targets from <file> instead of the default 'build.js'");
    console.log("  -d ................. run the default target");
    console.log("  -a ................. show all targets (including internal targets)");
    console.log("  --nodeps ........... do not run depencies of targets");
    console.log("  -v ................. verbose, show more information on what is  executed");
    console.log("  -t ................. list all tasks");
    console.log("");
    console.log("# ------------------------------------------------------------------------------");
    console.log("");
    if (project.name) {
        console.log("Project: ");
        console.log("  " + project.name + (project.description ? ": " + project.description : ""));
    }
    console.log("");
    console.log("Available targets:");
    try {
        var allTargetNames = Object.keys(project.targets);
        if (allTargetNames.length == 0) {
            console.log("  - no targets -");
        }
        else {
            var length_1 = 0;
            for (var i = 0; i < allTargetNames.length; i++) {
                var targetName = allTargetNames[i];
                length_1 = length_1 < targetName.length ? targetName.length : length_1;
            }
            for (var i = 0; i < allTargetNames.length; i++) {
                var targetName = allTargetNames[i];
                var target = project.targets[targetName];
                if (!target.internal || commandLine.showAlltargets) {
                    console.log("  " + targetName + " " + ".".repeat(length_1 + 6 - targetName.length)
                        + " " + (target.description ? target.description : " - no description -"));
                }
            }
        }
        console.log("");
        console.log("Default target: ");
        console.log(project.defaultTarget ? "  " + project.defaultTarget : "  - no default target -");
    }
    catch (exception) {
        console.log();
    }
    if (messageText) {
        console.log("");
        console.log("# ------------------------------------------------------------------------------");
        message(messageText);
    }
}
/**
 * Show error or other message
 *
 * @param message
 *
 */
function message(message) {
    console.log("");
    console.log("# " + message);
}
/**
 * Log a line of text
 *
 * @param line Line to log
 *
 */
function log(line) {
    console.log(line);
}
/**
 * List all tasks
 *
 * @param Optional: if given describe this task in detail
 *
 */
function listTasks(taskName) {
    var runner = createRunner();
    var taskNames = Object.keys(runner);
    if (taskName && taskNames.indexOf(taskName) != -1) {
        // describe a task in detail
        var task = runner[taskName];
        console.log("# Task: " + taskName);
        //console.log( "" );
        console.log("  Description: " + (task.description ? task.description : " - no description - "));
        if (!task.parameters) {
            console.log("  - no Parameters -");
        }
        else {
            console.log("  Parameters:");
            for (var i = 0; i < task.parameters.length; i++) {
                var parameter = task.parameters[i];
                var line = '    "' + parameter.name + '" (' + parameter.type + (parameter.optional ? ' optional' : '') + ')' + ' ...';
                var dots = 40 - line.length;
                if (dots < 0) {
                    dots = 0;
                }
                console.log(line + '.'.repeat(dots) + ' ' + parameter.description);
            }
        }
    }
    else {
        console.log("# Available tasks:");
        console.log("");
        var length_2 = 0;
        for (var i = 0; i < taskNames.length; i++) {
            var taskName_1 = taskNames[i];
            if (taskName_1.length > length_2) {
                length_2 = taskName_1.length;
            }
        }
        for (var i = 0; i < taskNames.length; i++) {
            var taskName_2 = taskNames[i];
            var task = runner[taskName_2];
            console.log("  " + taskName_2 + " " + ".".repeat(length_2 + 6 - taskName_2.length)
                + " " + (task.description ? task.description : " - no description -"));
        }
        console.log("");
        console.log("To show more information about a task, call:");
        console.log("");
        console.log("bee -t <taskname>");
    }
}
/**
 * Execute shell command
 *
 * @param command Shell command
 *
 */
function exec(command, onClose) {
    console.log("Running script: " + command);
    var spawn = require("child_process").spawn;
    var proc = spawn(command);
    proc.stdout.on("data", function (data) {
        console.log("" + data);
    });
    proc.stderr.on("data", function (data) {
        console.log("" + data);
    });
    proc.on('error', function (error) {
        console.log(error ? "" + error : "");
    });
    proc.on("close", function (code) {
        onClose(code);
    });
}
/**
 * Parse command line arguments in to an object for easy access
 *
 */
function parseCommandLine(process) {
    var commandLine = new CommandLine();
    var currentParamName = null;
    for (var i = 2; i < process.argv.length; i++) {
        var arg = process.argv[i];
        if (currentParamName == null) {
            if (arg == "-f") {
                currentParamName = "targetFile";
                commandLine.targets = [];
            }
            else if (arg == "-d") {
                commandLine.runDefaultTarget = true;
            }
            else if (arg == "-a") {
                commandLine.showAlltargets = true;
            }
            else if (arg == "--nodeps") {
                commandLine.nodeps = true;
            }
            else if (arg == "-v") {
                commandLine.verbose = true;
            }
            else if (arg == "-t") {
                commandLine.listTasks = true;
                currentParamName = "describeTask";
            }
            else {
                commandLine.targets.push(arg);
            }
        }
        else {
            commandLine[currentParamName] = arg;
            currentParamName = null;
        }
    }
    return commandLine;
}
/**
 * Load the build.js (or alternative file) of target
 *
 * @return The project object with loaded target configuration or an error message
 *
 */
function loadBuildFile() {
    var project = new Project();
    var targetFileName = commandLine.targetFile;
    if (!targetFileName) {
        targetFileName = "build.js";
    }
    var path = require('path');
    targetFileName = path.resolve(targetFileName);
    var fs = require('fs');
    if (!fs.existsSync(targetFileName)) {
        project.error = true;
        project.errorMessage = "Error: target file '" + targetFileName + "' not found.";
    }
    else {
        try {
            var targetsFile = require(targetFileName);
            targetsFile.setup(project);
        }
        catch (error) {
            project.error = true;
            project.errorMessage = "Error in setup of target file '" + commandLine.targetFile + "':\n";
            if (error && error.stack) {
                project.errorMessage += error.stack;
            }
        }
    }
    return project;
}
// Taks ---------------------------------------
/**
 * Create a runtime environment for targets which allows them to use many bee functionality
 *
 */
function createRunner() {
    var bee = {
        /**
         * Task: Execute shell command
         *
         * @param command Shell command
         *
         */
        exec: {
            description: "Execute a shell command.",
            parameters: [
                {
                    name: "command",
                    description: "Complete command line to be executed",
                    type: "string",
                    optional: false
                }
            ],
            run: function (input) {
                var command;
                if (typeof input === 'string' || input instanceof String) {
                    command = "" + input;
                }
                else {
                    command = input.command;
                }
                var execSync = require("child_process").execSync;
                try {
                    if (commandLine.verbose) {
                        console.log("Shell command: " + command);
                    }
                    var output = execSync(command);
                    if (output) {
                        console.log("" + output);
                    }
                }
                catch (error) {
                    if (error.status) {
                        console.log("Return code: " + error.status);
                    }
                    if (error.message) {
                        console.log(error.message);
                    }
                    if (error.stdout) {
                        console.log("" + error.stdout);
                    }
                    if (error.stderr) {
                        console.log("" + error.stderr);
                    }
                }
            }
        },
        /**
         * Task: Call typescript compile tsc
         *
         * @param config.file Optional file specified (for example: *.tsc)
         *
         */
        tsc: {
            description: "Compile typescript source file.",
            parameters: [
                {
                    name: "file",
                    description: "File or wildcard of files to compile",
                    type: "string",
                    optional: true
                },
                {
                    name: "targetDir",
                    description: "Target directory for compiles js files",
                    type: "string",
                    optional: true
                }
            ],
            run: function (config) {
                var file = "";
                var targetDir = "";
                if (config) {
                    if (config.file) {
                        file = " " + config.file;
                    }
                    if (config.targetDir) {
                        targetDir = " -outDir " + config.targetDir;
                    }
                }
                bee.exec.run("tsc" + file + targetDir);
            }
        },
        /**
         * Task: Run nodejs script
         *
         * @param config.file Optional file specified (for example: *.tsc)
         *
         */
        node: {
            description: "Call a node script.",
            parameters: [
                {
                    name: "file",
                    description: "File name of node script",
                    type: "string",
                    optional: false
                }
            ],
            run: function (config) {
                if (!config || !config.file) {
                    usage("Error: no test script specified");
                }
                else {
                    bee.exec.run("node " + config.file);
                }
            }
        },
        /**
         * Task: Run unit test with tsunit
         *
         * @param config.file File containg unit tests
         *
         */
        test: {
            description: "Perform unit tests.",
            parameters: [
                {
                    name: "file",
                    description: "File name of unit test script",
                    type: "string",
                    optional: false
                }
            ],
            run: function (config) {
                bee.node.run(config);
            }
        },
        /**
         * Delete directory and all content
         *
         * @param config.dir Directory to delete
         *
         */
        rmdir: {
            description: "Delete a directory and all its content.",
            parameters: [
                {
                    name: "dir",
                    description: "Name of a directory below the project directory.",
                    type: "string",
                    optional: false
                }
            ],
            run: function (config) {
                if (!config.dir) {
                    throw "Error: missing parameter config.dir";
                }
                else {
                    var path = require('path');
                    var workdir = path.resolve(".");
                    var deletedir = path.resolve(config.dir);
                    if (!deletedir.startsWith(workdir)) {
                        throw "Error: rmdir is not allowed outside of working directory.";
                    }
                    bee.exec.run("rm -r " + deletedir);
                }
            }
        }
    };
    return bee;
}
