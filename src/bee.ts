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

// classes, types, interfaces

interface Process {
  argv: string[]
}

class CommandLine {
  isEmpty = true;
  targets = [];
  runDefaultTarget = false;
  showProjectInformation = false;
  showDependencies = false;
  showInternalTargets = false;
  nodeps = false;
  verbose = false;
  listTasks = false;
  targetFile: string;
  describeTask: string;
  showHelp = false;
}

/**
 * A target defines a step in the project build process
 */
class Target {
  description: string;
  depends: Array<string>;
  code: Function;
}

/**
 * The description of the current software project built with bee
 */
class Project {
  name: string;
  description: string;
  error = false;
  errorMessage: string;
  targets = new Array<Target>();
  defaultTarget: string;
}

/**
 * A parameter defines one unit of input to a task
 */
class Parameter {
  name: string;
  description: string;
  type: string;
  optional = false;
  constructor( name: string, description: string, type: string, optional: boolean ) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.optional = optional;
  }
}

/**
 * A task is one operation which bee can perform
 */
class Task {
  description: string;
  parameters: Array<Parameter>;
  run: Function;
  // run: function( config ) {
  //   bee.node.run( config );
  // }
  constructor( description: string, parameters: Array<Parameter>, run: Function ) {
    this.description = description;
    this.parameters = parameters;
    this.run = run;
  }
}


let bee = {

  exec: new Task(
    "Execute a shell command.",
    [ new Parameter( "command", "Complete command line to be executed", "string", false ) ],
    function( input ) {
      let command;
      if( typeof input === 'string' || input instanceof String ) {
        command = "" + input;
      }
      else {
        command = input.command;
      }
      const { execSync } = require("child_process");
      try {
        if( commandLine.verbose ) {
          console.log( "Shell command: " + command );
        }
        let output = execSync( command );
        if( output ) {
          console.log( "" + output );
        }
      }
      catch( error ) {
        if( error.status ) {
          console.log( "Return code: " + error.status );
        }
        if( error.message ) {
          console.log( error.message );
        }
        if( error.stdout ) {
          console.log( "" + error.stdout );
        }
        if( error.stderr ) {
          console.log( "" + error.stderr );
        }
      }
    }

  ),
  
  tsc: new Task(
    "Compile typescript source file.",
    [
      new Parameter( "file", "File or wildcard of files to compile", "string", true ),
      new Parameter( "targetDir", "Target directory for compiles js files", "string", true )
    ],
    function( config ) {
      let file = "";
      let targetDir = "";
      if( config ) {
        if( config.file ) {
          file = " " + config.file;
        }
        if( config.targetDir ) {
          targetDir = " -outDir " + config.targetDir;
        }
      }
      bee.exec.run( "tsc" + file + targetDir );
    }
  ),
  
  node: new Task(
    "Call a node script.",
    [
      new Parameter( "file", "File name of node script", "string", false )
    ],
    function( config ) {
      if( !config || !config.file ) {
        message( "Error: no test script specified" );
      }
      else {
        bee.exec.run( "node " + config.file );
      }
    }
  ),
  
  test: new Task(
    "Perform unit tests.",
    [
      new Parameter( "file", "File name of unit test script", "string", false )
    ],
    function( config ) {
      bee.node.run( config );
    }
  ),
  
  rmdir: new Task(
    "Delete a directory and all its content.",
    [
      new Parameter( "dir", "Name of a directory below the project directory.", "string", false )
    ],
    function( config ) {
      if( !config.dir ) {
        throw "Error: missing parameter config.dir";
      }
      else {
        const path = require( 'path' );
        let workdir = path.resolve( "." );
        let deletedir = path.resolve( config.dir );
        if( !deletedir.startsWith( workdir ) ) {
          throw "Error: rmdir is not allowed outside of working directory."
        }
        bee.exec.run( "rm -r " + deletedir );
      }
    }
  )
  
}




// -------------------------------------------------------------------
// command line execution


let t0 = Date.now();

console.log( "# ==============================================================================" );
console.log( "                                                                _" );
console.log( "                                                               | |__   ___  ___" );
console.log( "                                                               | '_ \\ / _ \\/ _ \\" );
console.log( "                                                               | |_) |  __/  __/" );
console.log( "                                                               |_.__/ \\___|\\___|" );
console.log( " * to build and to serve *                                             bee 0.4.0" );

let commandLine = parseCommandLine();
let project: Project;

if( commandLine.isEmpty ) {
  console.log( "" );
  console.log( "Use 'bee -h' to show more information." );
}
else if( commandLine.showHelp ) {
  usage( null );
}
else {

  project = loadBuildFile();

  if( project.error ) {
    usage( project.errorMessage );
  }
  else if( commandLine.showProjectInformation ) {
    usage( null );
  }
  else {
  
    if( commandLine.listTasks ) {
      listTasks( commandLine.describeTask );
    }
    else {
  
      if( commandLine.runDefaultTarget ) {
        if( !project.defaultTarget ) {
          usage( "Error: Cannot run default target because no default target is defined.")
        }
        else {
          commandLine.targets.push( project.defaultTarget );
        }
      }
    
      if( commandLine.targets.length == 0 && !commandLine.showHelp ) {
        usage( "Please define one or more targets to run or run with option -d" );
      }
      else {
    
        let alreadyCalled = new Object();
      
        for( let i = 0; i < commandLine.targets.length; i++ ) {
      
          let targetName = commandLine.targets[ i ];
          runTarget( targetName, alreadyCalled, project );
      
        }
        
      }
    
    }
  
  }

}

console.log( "" );
console.log( "# ------------------------------------------------------------------------------" );
console.log( "Bee finished its work after " + (Date.now() - t0) + " millis." );
console.log( "# ==============================================================================" );

// * * * ----------------------------------------------


function runTarget( targetName: string, alreadyCalled: Object, project: Project ) {

  let target = project.targets[ targetName ];
  if( !target ) {
    throw "Error: target '" + targetName + "' not found.";
  }
  else {

    // call dependencies first
    if( target.depends && !commandLine.nodeps ) {
      for( let i = 0; i < target.depends.length; i++ ) {
        let dependencyName = target.depends[ i ];
        runTarget( dependencyName, alreadyCalled, project );
      }
    }

    if( !alreadyCalled[ targetName ] ) {

      alreadyCalled[ targetName ] = true;
      let target = project.targets[ targetName ];

      // call the actual target last
      try {
        log( "" );
        log( "Performing target: '" + targetName + "'" );
        target.code( bee );
      }
      catch( error ) {
        message( "Error in target '" + targetName + "':\n" + error );
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
function usage( messageText: string ) {

  if( commandLine.showHelp ) {

    console.log( "" );
    console.log( "Usage:" );
    console.log( "  bee [options] -d | [target [target2 [target3]  ..]]" );
    console.log( "" );
    console.log( "Runs the given targets or the default target." );
    console.log( "" );
    console.log( "Options:" );
    console.log( "  -f <file> .......... load targets from <file> instead of the default 'build.js'" );
    console.log( "  -d ................. run the default target" );
    console.log( "  -p ................. show project information and targets" );
    console.log( "  -pp ................ show dependencies too" );
    console.log( "  -ppp ............... show internal targets too" );
    console.log( "  --nodeps ........... do not run depencies of targets" );
    console.log( "  -v ................. verbose, show more information on what is  executed" );
    console.log( "  -t ................. list all tasks" );

  }

  if( commandLine.showProjectInformation ) {

    console.log( "" );
    console.log( "# ------------------------------------------------------------------------------" );
    console.log( "" );
      if( project.name ) {
      console.log( "Project: " );
      console.log( "  " + project.name + ( project.description ? ": " + project.description : "" ) );
    }

    console.log( "" );
    console.log( "Available targets:" );

    try {

      let allTargetNames = Object.keys( project.targets );
    
      if( allTargetNames.length == 0 ) {
        console.log( "  - no targets -" );
      }
      else {
        let length = 0;
        for( let i = 0; i < allTargetNames.length; i++ ) {
          let targetName = allTargetNames[ i ];
          length = length < targetName.length ? targetName.length : length;
        }
        for( let i = 0; i < allTargetNames.length; i++ ) {
          let targetName = allTargetNames[ i ];
          let target = project.targets[ targetName ];
          if( !target.internal || commandLine.showInternalTargets ) {
            let line = "  " + targetName + " " + ".".repeat( length + 6 - targetName.length ) 
              + " " + (target.description ? target.description : " - no description -" );
            let sep = "";
            if( commandLine.showDependencies ) {
              line += " (depends: ";
              for( let ii = 0; ii < target.depends.length; ii++ ) {
                line += sep + target.depends[ ii ];
                sep = ", ";
              }
              line += ")";
            }
            console.log( line );
          }
        }
      }
      console.log( "" );
      console.log( "Default target: " );
      console.log( project.defaultTarget ? "  " + project.defaultTarget : "  - no default target -" );
    
    }
    catch( exception ) {
      console.log();
    }

  }

  if( messageText ) {
    message( messageText );
  }

}


/**
 * Show error or other message
 * 
 * @param message 
 * 
 */
function message( message: string ) {

  console.log( "" );
  console.log( "# ------------------------------------------------------------------------------" );
  console.log( message );

}


/**
 * Log a line of text
 * 
 * @param line Line to log
 * 
 */
function log( line: string ) {
  console.log( line );
}

/**
 * List all tasks
 * 
 * @param Optional: if given describe this task in detail
 * 
 */
function listTasks( taskName: string ) {

  let taskNames = Object.keys( bee );

  if( taskName && taskNames.indexOf( taskName ) != -1 ) {
    // describe a task in detail
    let task = bee[ taskName ];
    console.log( "# Task: " + taskName );
    //console.log( "" );
    console.log( "  Description: " + (task.description ? task.description : " - no description - " ) );
    if( !task.parameters ) {
      console.log( "  - no Parameters -" );
    }
    else {
      console.log( "  Parameters:" );
      for( let i = 0; i < task.parameters.length; i++ ) {
        let parameter = task.parameters[ i ];
        let line = '    "' + parameter.name + '" (' + parameter.type + ( parameter.optional ? ' optional' : '' ) + ')' + ' ...';
        let dots = 40 - line.length;
        if( dots < 0 ) {
          dots = 0;
        }
        console.log( line + '.'.repeat( dots ) + ' '  + parameter.description );
      }
    }
  }
  else {
    console.log( "" );
    console.log( "Available tasks:" );
    console.log( "" );
    let length = 0;
    for( let i = 0; i < taskNames.length; i++ ) {
      let taskName = taskNames[ i ];
      if( taskName.length > length ) {
        length = taskName.length;
      }
    }
    for( let i = 0; i < taskNames.length; i++ ) {
      let taskName = taskNames[ i ];
      let task = bee[ taskName ];
      console.log( "  " + taskName + " " + ".".repeat( length + 6 - taskName.length ) 
        + " " + (task.description ? task.description : " - no description -" ) );
    }
    console.log( "" );
    console.log( "To show more information about a task, call:" );
    console.log( "" );
    console.log( "bee -t <taskname>" );  
  }

}


/**
 * Parse command line arguments in to an object for easy access
 * 
 */
function parseCommandLine() : CommandLine {

  let commandLine = new CommandLine();

  let currentParamName = null;

  for( let i = 2; i < process.argv.length; i++ ) {
    commandLine.isEmpty = false;
    let arg = process.argv[ i ];
    if( currentParamName == null ) {
      if( arg == "-f" ) {
        currentParamName = "targetFile"
        commandLine.targets = [];
      }
      else if( arg == "-d" ) {
        commandLine.runDefaultTarget = true;
      }
      else if( arg == "-p" ) {
        commandLine.showProjectInformation = true;
      }
      else if( arg == "-pp" ) {
        commandLine.showProjectInformation = true;
        commandLine.showDependencies = true;
      }
      else if( arg == "-ppp" ) {
        commandLine.showProjectInformation = true;
        commandLine.showDependencies = true;
        commandLine.showInternalTargets = true;
      }
      else if( arg == "--nodeps" ) {
        commandLine.nodeps = true;
      }
      else if( arg == "-v" ) {
        commandLine.verbose = true;
      }
      else if( arg == "-t" ) {
        commandLine.listTasks = true;
        currentParamName = "describeTask"
      }
      else if( arg == "-h" ) {
        commandLine.showHelp = true;
      }
      else {
        commandLine.targets.push( arg );
      }
    }
    else {
      commandLine[ currentParamName ] = arg;
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
function loadBuildFile() : Project {

  let project = new Project();

  let targetFileName = commandLine.targetFile;

  if( !targetFileName ) {
    targetFileName = "build.js";
  }
  
  const path = require( 'path' );
  targetFileName = path.resolve( targetFileName );

  const fs = require( 'fs' );

  if( !fs.existsSync( targetFileName ) ) {
    project.error = true;
    project.errorMessage = "Error: target file '" + targetFileName + "' not found.";
  }
  else {

    try {

      let targetsFile = require( targetFileName );
      targetsFile.setup( project );
  
    }
    catch( error ) {
      project.error = true;
      project.errorMessage = "Error in setup of target file '" + targetFileName + "':\n";
      if( error && error.stack ) {
        project.errorMessage += error.stack;
      }
    }

  }

  return project;

}

