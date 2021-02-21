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

/**
 * A target defines a step in the project build process
 */
class Target {
  description: string;
  depends: Array<string>;
  code: Function;
}

/**
 * A unit test
 */
class Test {
  description: string;
  code: Function;
}

/**
 * The description of the current software project built with bee
 */
class Project {
  name: "Unitialized";
  description: string;
  error = false;
  errorMessage: string;
  targets = new Array<Target>();
  defaultTarget: string;
  tests = new Array<Test>();
}

// -------------------------------------------------------------------
// command line execution


let t0 = Date.now();

console.log( "# ==============================================================================" );
console.log( "" );
console.log( "                . - .         ___                         _" );
console.log( "              *       .       \\__))   //                 | |__   ___  ___" );
console.log( "           .            * .  <((_(()(o_o)                |  _ \\ / _ \\/ _ \\" );
console.log( "  .      *                    //  |\\                     | |_) |  __/  __/" );
console.log( "    * .                                                  |_.__/ \\___|\\___|" );
console.log( "                                                                       bee 0.4.0" );
console.log( "                      * to build and to serve *" );
console.log( "# ------------------------------------------------------------------------------" );

let commandLine = parseCommandLine();
let bee = new Bee( commandLine );
let project = new Project();

if( commandLine.isEmpty ) {
  console.log( "" );
  console.log( "Use 'bee -h' to show help." );
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
          console.log( "Running default target: " + project.defaultTarget );
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
          runTarget( targetName, alreadyCalled, project, null );
          if( project.error && project.errorMessage ) {
            console.log( project.errorMessage );
          }
      
        }
        
      }
    
    }
  
  }

}

console.log( "" );
console.log( "# ------------------------------------------------------------------------------" );
console.log( "# Runtime " + (Date.now() - t0) + " ms" );
let returnCode = 0;
if( project.error ) {
  if( commandLine.nofail ) {
    console.log( "# SUCCESS: There were some failures, but --nofail was set. So yeah, I guess." );
  }
  else {
    console.log( "# FAILED: Sorry. Bee failed." );
    returnCode = 1;
  }
}
else {
  console.log( "# SUCCESS: Yeah! Bee finished its work succesfully." );
}
console.log( "# ==============================================================================" );

process.exit( returnCode ); 

// * * * ----------------------------------------------


function runTarget( targetName: string, alreadyCalled: Object, project: Project, parentTargetName: string ) {

  let target = project.targets[ targetName ];
  if( !target ) {
    project.error = true;
    project.errorMessage = "Error: target '" + targetName + "' not found.";
    return;
  }
  else {

    // call dependencies first
    if( target.depends && !commandLine.nodeps ) {
      for( let i = 0; i < target.depends.length; i++ ) {
        let dependencyName = target.depends[ i ];
        runTarget( dependencyName, alreadyCalled, project, targetName );
        if( project.error && !commandLine.nofail ) {
          return;
        }
      }
    }

    if( !alreadyCalled[ targetName ] ) {

      alreadyCalled[ targetName ] = true;
      let target = project.targets[ targetName ];

      // call the actual target last
      try {
        log( "" );
        log( "Performing target: '" + targetName + "'" 
          + ( parentTargetName ? " (dependency of " + parentTargetName + ")": "" ) );
        target.code( bee );
      }
      catch( error ) {
        project.error = true;
        project.errorMessage = "Error in target '" + targetName + "':\n" + error;
      }

    }

  }

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

