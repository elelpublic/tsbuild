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
var CommandLine = /** @class */ (function () {
    function CommandLine() {
        this.isEmpty = true;
        this.targets = [];
        this.runDefaultTarget = false;
        this.showProjectInformation = false;
        this.showDependencies = false;
        this.showInternalTargets = false;
        this.nodeps = false;
        this.verbose = false;
        this.listTasks = false;
        this.showHelp = false;
    }
    return CommandLine;
}());
/**
 * A target defines a step in the project build process
 */
var Target = /** @class */ (function () {
    function Target() {
    }
    return Target;
}());
/**
 * The description of the current software project built with bee
 */
var Project = /** @class */ (function () {
    function Project() {
        this.error = false;
        this.targets = new Array();
    }
    return Project;
}());
/**
 * A parameter defines one unit of input to a task
 */
var Parameter = /** @class */ (function () {
    function Parameter(name, description, type, optional) {
        this.optional = false;
        this.name = name;
        this.description = description;
        this.type = type;
        this.optional = optional;
    }
    return Parameter;
}());
/**
 * A task is one operation which bee can perform
 */
var Task = /** @class */ (function () {
    // run: function( config ) {
    //   bee.node.run( config );
    // }
    function Task(description, parameters, run) {
        this.description = description;
        this.parameters = parameters;
        this.run = run;
    }
    return Task;
}());
var bee = {
    exec: new Task("Execute a shell command.", [new Parameter("command", "Complete command line to be executed", "string", false)], function (input) {
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
    }),
    tsc: new Task("Compile typescript source file.", [
        new Parameter("file", "File or wildcard of files to compile", "string", true),
        new Parameter("outDir", "Target directory for compiles js files", "string", true)
    ], function (config) {
        var file = "";
        var outDir = "";
        if (config) {
            if (config.file) {
                file = " " + config.file;
            }
            if (config.outDir) {
                outDir = " -outDir " + config.outDir;
            }
        }
        bee.exec.run("tsc" + file + outDir);
    }),
    node: new Task("Call a node script.", [
        new Parameter("file", "File name of node script", "string", false)
    ], function (config) {
        if (!config || !config.file) {
            message("Error: no test script specified");
        }
        else {
            bee.exec.run("node " + config.file);
        }
    }),
    test: new Task("Perform unit tests.", [
        new Parameter("file", "File name of unit test script", "string", false)
    ], function (config) {
        bee.node.run(config);
    }),
    rmdir: new Task("Delete a directory and all its content.", [
        new Parameter("dir", "Name of a directory below the project directory.", "string", false)
    ], function (config) {
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
    })
};
// -------------------------------------------------------------------
// command line execution
var t0 = Date.now();
console.log("# ==============================================================================");
console.log("                                                                _");
console.log("                                                               | |__   ___  ___");
console.log("                                                               | '_ \\ / _ \\/ _ \\");
console.log("                                                               | |_) |  __/  __/");
console.log("                                                               |_.__/ \\___|\\___|");
console.log(" * to build and to serve *                                             bee 0.4.0");
var commandLine = parseCommandLine();
var project;
if (commandLine.isEmpty) {
    console.log("");
    console.log("Use 'bee -h' to show more information.");
}
else if (commandLine.showHelp) {
    usage(null);
}
else {
    project = loadBuildFile();
    if (project.error) {
        usage(project.errorMessage);
    }
    else if (commandLine.showProjectInformation) {
        usage(null);
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
            if (commandLine.targets.length == 0 && !commandLine.showHelp) {
                usage("Please define one or more targets to run or run with option -d");
            }
            else {
                var alreadyCalled = new Object();
                for (var i = 0; i < commandLine.targets.length; i++) {
                    var targetName = commandLine.targets[i];
                    runTarget(targetName, alreadyCalled, project);
                    if (project.error) {
                        project.errorMessage;
                    }
                }
            }
        }
    }
}
console.log("");
console.log("# ------------------------------------------------------------------------------");
console.log("Bee finished its work after " + (Date.now() - t0) + " millis.");
console.log("# ==============================================================================");
// * * * ----------------------------------------------
function runTarget(targetName, alreadyCalled, project) {
    var target = project.targets[targetName];
    if (!target) {
        project.error = true;
        project.errorMessage = "Error: target '" + targetName + "' not found.";
        return;
    }
    else {
        // call dependencies first
        if (target.depends && !commandLine.nodeps) {
            for (var i = 0; i < target.depends.length; i++) {
                var dependencyName = target.depends[i];
                runTarget(dependencyName, alreadyCalled, project);
                if (project.error) {
                    return;
                }
            }
        }
        if (!alreadyCalled[targetName]) {
            alreadyCalled[targetName] = true;
            var target_1 = project.targets[targetName];
            // call the actual target last
            try {
                log("");
                log("Performing target: '" + targetName + "'");
                target_1.code(bee);
            }
            catch (error) {
                project.error = true;
                project.errorMessage = "Error in target '" + targetName + "':\n" + error;
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
    if (commandLine.showHelp) {
        console.log("");
        console.log("Usage:");
        console.log("  bee [options] -d | [target [target2 [target3]  ..]]");
        console.log("");
        console.log("Runs the given targets or the default target.");
        console.log("");
        console.log("Options:");
        console.log("  -f <file> .......... load targets from <file> instead of the default 'build.js'");
        console.log("  -d ................. run the default target");
        console.log("  -p ................. show project information and targets");
        console.log("  -pp ................ show dependencies too");
        console.log("  -ppp ............... show internal targets too");
        console.log("  --nodeps ........... do not run depencies of targets");
        console.log("  -v ................. verbose, show more information on what is  executed");
        console.log("  -t ................. list all tasks");
    }
    if (commandLine.showProjectInformation) {
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
                    if (!target.internal || commandLine.showInternalTargets) {
                        var line = "  " + targetName + " " + ".".repeat(length_1 + 6 - targetName.length)
                            + " " + (target.description ? target.description : " - no description -");
                        var sep = "";
                        if (commandLine.showDependencies) {
                            line += " (depends: ";
                            for (var ii = 0; ii < target.depends.length; ii++) {
                                line += sep + target.depends[ii];
                                sep = ", ";
                            }
                            line += ")";
                        }
                        console.log(line);
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
    }
    if (messageText) {
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
    console.log("# ------------------------------------------------------------------------------");
    console.log(message);
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
    var taskNames = Object.keys(bee);
    if (taskName && taskNames.indexOf(taskName) != -1) {
        // describe a task in detail
        var task = bee[taskName];
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
        console.log("");
        console.log("Available tasks:");
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
            var task = bee[taskName_2];
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
 * Parse command line arguments in to an object for easy access
 *
 */
function parseCommandLine() {
    var commandLine = new CommandLine();
    var currentParamName = null;
    for (var i = 2; i < process.argv.length; i++) {
        commandLine.isEmpty = false;
        var arg = process.argv[i];
        if (currentParamName == null) {
            if (arg == "-f") {
                currentParamName = "targetFile";
                commandLine.targets = [];
            }
            else if (arg == "-d") {
                commandLine.runDefaultTarget = true;
            }
            else if (arg == "-p") {
                commandLine.showProjectInformation = true;
            }
            else if (arg == "-pp") {
                commandLine.showProjectInformation = true;
                commandLine.showDependencies = true;
            }
            else if (arg == "-ppp") {
                commandLine.showProjectInformation = true;
                commandLine.showDependencies = true;
                commandLine.showInternalTargets = true;
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
            else if (arg == "-h") {
                commandLine.showHelp = true;
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
            project.errorMessage = "Error in setup of target file '" + targetFileName + "':\n";
            if (error && error.stack) {
                project.errorMessage += error.stack;
            }
        }
    }
    return project;
}
