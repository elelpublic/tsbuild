/**
 * Command Line Interface
 * 
 */

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
  nofail = false;
  verbose = false;
  listTasks = false;
  targetFile: string;
  describeTask: string;
  showHelp = false;
  classicLogging = false;
  createSampleTest = false;

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
      else if( arg == "--nofail" ) {
        commandLine.nofail = true;
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
      else if( arg == "-c" ) {
        commandLine.classicLogging = true;
      }
      else if( arg == "--sampletest" ) {
        commandLine.createSampleTest = true;
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
    console.log( "  --nofail ........... continue on errors" );
    console.log( "  -v ................. verbose, show more information on what is  executed" );
    console.log( "  -t ................. list all tasks" );
    console.log( "  --sampletest ....... create a sample test stub" );

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

  let taskNames = Object.keys( bee.tasks );

  if( taskName && taskNames.indexOf( taskName ) != -1 ) {
    // describe a task in detail
    let task = bee.tasks[ taskName ];
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
      let task = bee.tasks[ taskName ];
      console.log( "  " + taskName + " " + ".".repeat( length + 6 - taskName.length ) 
        + " " + (task.description ? task.description : " - no description -" ) );
    }
    console.log( "" );
    console.log( "To show more information about a task, call:" );
    console.log( "" );
    console.log( "bee -t <taskname>" );  
  }

}
