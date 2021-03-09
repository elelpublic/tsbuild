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
 * A task can return ok, warning or error along with some text message
 */
class TaskResult {
  error = false;
  warning = false;
  ok: () => boolean = function() {
    return !this.error;
  };
  message: string;
  constructor( error: boolean, warning: boolean, message: string ) {
    this.error = error;
    this.warning = warning;
    this.message = message;
  }
  static OK = function() { return new TaskResult( false, false, null ) };
  static Message( message: string ) { return new TaskResult( false, false, message ) };  
  static Warning( message: string ) { return new TaskResult( false, true, message ) };  
  static Error( message: string ) { return new TaskResult( true, false, message ) };  
}

/**
 * A task is one operation which bee can perform
 */
class Task {

  tasks: Tasks;
  description: string;
  parameters: Array<Parameter>;
  
  //run: Function;

  run: ( bee: Bee, input ) => TaskResult;
  
  // run: function( config ) {
  //   bee.node.run( config );
  // }
  
  constructor( tasks: Tasks, description: string, parameters: Array<Parameter>, run: ( bee: Bee, input ) => TaskResult ) {
    this.tasks = tasks;
    this.description = description;
    this.parameters = parameters;
    this.run = run;
  }

}


class Tasks {
  
  exec: Task
  call: Task
  tsc: Task
  test: Task
  rmdir: Task
  open: Task
  file2string: Task

  constructor() {

    let tasks = this;

    /**
     * - exec ------------------------------------------------------------------------------------------
     */
    this.exec = new Task(

      tasks,
      "Execute a shell command.",
      [ new Parameter( "command", "Complete command line to be executed", "string", false ) ],
      
      function( bee: Bee, input ) {
        
        let command;
        if( typeof input === 'string' || input instanceof String ) {
          command = "" + input;
        }
        else {
          command = input.command;
        }
        
        let result = TaskResult.OK();
    
        const { execSync } = require("child_process");
        try {
          if( commandLine.verbose ) {
            console.log( "Shell command: " + command );
          }
          let output = execSync( command );
          if( output ) {
            result = TaskResult.Message( "" + output );
          }
        }
        catch( error ) {
          let message = "";
          if( error.status ) {
            message += "Return code: " + error.status + "\n";
          }
          if( error.message ) {
            message += error.message + "\n";
          }
          if( error.stdout ) {
            message += error.stdout + "\n";
          }
          if( error.stderr ) {
            message += error.stderr + "\n"
          }
          result = TaskResult.Error( message );
        }
        return result;
      }
    
    );
    
    /**
     * - tsc ------------------------------------------------------------------------------------------
     */
    this.tsc = new Task(
      tasks,
      "Compile typescript source file.",
      [
        new Parameter( "file", "File or wildcard of files to compile", "string", true ),
        new Parameter( "files", "List of files to compile", "string", true ),
        new Parameter( "outDir", "Target directory for compiles js files", "string", true ),
        new Parameter( "outFile", "Target javascript file", "string", true )
      ],
      function( bee: Bee, config ) {
        let file = "";
        let outDir = "";
        if( config ) {
          if( config.file ) {
            file = " " + config.file;
          }
          if( config.files ) {
            for( let i = 0; i < config.files.length; i++ ) {
              file += " " + config.files[ i ];
            }
          }
          if( config.outDir ) {
            outDir = " -outDir " + config.outDir;
          }
          else if( config.outFile ) {
            outDir = " -outFile " + config.outFile;
          }
        }
        return tasks.exec.run( bee, "tsc" + file + outDir );
      }
    );
    
    /**
     * - call ------------------------------------------------------------------------------------------
     */
    this.call = new Task(
      tasks,
      "Call a node script.",
      [
        new Parameter( "file", "File name of node script", "string", false )
      ],
      function( bee: Bee, config ) {
        if( !config || !config.file ) {
          return TaskResult.Error( "Error: no test script specified" );
        }
        else {
          const path = require( 'path' );
          let testScriptFile = path.resolve( config.file );
          let testScript = require( testScriptFile );
          testScript.test( bee );
          return TaskResult.OK();
          //return tasks.exec.run( bee, "node " + config.file );
        }
      }
    );
    
    /**
     * - test ------------------------------------------------------------------------------------------
     */
    this.test = new Task(
      tasks,
      "Perform unit tests.",
      [
        new Parameter( "test", "Name of test", "string", false )
      ],
      function( bee: Bee, config ) {
        if( !config || !config.file ) {
          return TaskResult.Error( "Error: no test script specified" );
        }
        else {
          let result = tasks.call.run( bee, config );
          if( !result.ok ) {
            return result;
          }
          if( !bee.getTestRun().getSummary().allOk() ) {
            return TaskResult.Error( "Some tests failed" );
          }
          else {
            return TaskResult.OK();
          }
        }
      }
    );
    
    /**
     * - rmdir ------------------------------------------------------------------------------------------
     */
    this.rmdir = new Task(
      tasks,
      "Delete a directory and all its content.",
      [
        new Parameter( "dir", "Name of a directory below the project directory.", "string", false )
      ],
      function( bee: Bee, config ) {
        if( !config.dir ) {
          return TaskResult.Error( "Error: missing parameter dir" );
        }
        else {
          const path = require( 'path' );
          let workdir = path.resolve( "." );
          let deletedir = path.resolve( config.dir );
          if( !deletedir.startsWith( workdir ) ) {
            throw "Error: rmdir is not allowed outside of working directory."
          }
          return tasks.exec.run( bee, "rm -r " + deletedir );
        }
      }
    );
    
    /**
     * - open ------------------------------------------------------------------------------------------
     */
    this.open = new Task(
      tasks,
      "Open a file with associated app in desktop environment.",
      [
        new Parameter( "file", "Name of file to open.", "string", false )
      ],
      function( bee: Bee, config ) {
        if( !config.file ) {
          return TaskResult.Error( "Error: missing parameter file" );
        }
        else {
          const path = require( 'path' );
          let file = path.resolve( config.file );
          return tasks.exec.run( bee, "open " + file );
        }
      }
    );

    /**
     * - file2string ------------------------------------------------------------------------------------------
     */
    this.file2string = new Task(
      tasks,
      "Read a text file and create a js/ts file with the file content as a string variable.",
      [
        new Parameter( "input", "Name of file to read.", "string", false ),
        new Parameter( "ouput", "Name of js/ts file to write.", "string", false )
      ],
      function( bee: Bee, config ) {
        if( !config.input ) {
          return TaskResult.Error( "Error: missing parameter input" );
        }
        else if( !config.output ) {
          return TaskResult.Error( "Error: missing parameter output" );
        }
        else {
          const path = require( 'path' );
          let file = path.resolve( config.input );
          const readline = require( 'readline' );
          let fs = require( 'fs' );
          if( !fs.existsSync( file ) ) {
            return TaskResult.Error( "Input file not found: " + file );
          }
          else {
            const readInterface = readline.createInterface({
              input: fs.createReadStream( file ),
              output: process.stdout,
              console: false
            });
            // readInterface.on( 'line', function( line ) {
            //   console.log( ">>> " + line );
            // });

            const start = async () =>{
              for await (const line of readInterface ) {
                console.log( ">>> " + line )
              }
            }
            start()
            return TaskResult.OK();  
          }
        }
      }
    );

  }
};

class Bee {
  commandLine: CommandLine;
  testRun: TestRun;
  interface = {
    Status: Status,
    addStatus: addStatus,
    statusName: statusName
  }
  constructor( commandLine: CommandLine ) {
    this.commandLine = commandLine;
  }
  tasks = new Tasks();
  run = function( result: TaskResult ) {
    if( result.error ) {
      project.error = true;
      let message = "Error";
      if( result.message ) {
        message = result.message;
      }
      if( this.commandLine.nofail ) {
        console.log( message );
        console.log( "Continuing... (because --nofail is set)" );
      }
      else {
        throw message;
      }
    }
    else if( result.warning ) {
      if( result.message ) {
        console.log( result.message );
      }
      else {
        console.log( "Warning" );
      }
    }
    else {
      if( result.message ) {
        console.log( result.message );
      }
    }
  }
  getTestRun() : TestRun {
    if( !this.testRun ) {
      this.testRun = new TestRun( "Unnamed test", false );
    }
    return this.testRun;
  }

}
