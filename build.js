exports.setup = function( project ) {

  project.name = "bee";
  project.description = "An antlike builder for nodejs and especially for me.";
  project.defaultTarget = "build";

  project.targets[ "build" ] = {
    description: "Build the project, create distribution files.",
    depends: [ "test" ],
    code: function( bee ) {
      bee.tasks.tsc.run({ outFile: "target/bee", files: [ "src/main/tasks.ts", "src/main/bee.ts" ] });
//      bee.tsc.run( { file: "src/*.ts", outDir: "target" } );
    }
  };

  project.targets[ "install" ] = {
    description: "Install new version of bee in this project.",
    depends: [ "build" ],
    code: function( bee ) {
      bee.run( bee.tasks.exec.run( { command: "echo 'Will install bee.ts as bee.'" } ) );
      bee.run( bee.tasks.exec.run( { command: "cp target/bee bee" } ) );
      bee.run( bee.tasks.exec.run( { command: "echo 'Installation finished.'" } ) );
    }
  };

  project.targets[ "test" ] = {
    description: "Run unit tests",
    depends: [ "compileTests" ],
    code: function( bee ) {
      //bee.exec.run( "src/tests/alltests.js" );
      bee.run( bee.tasks.test.run({ dir: "target/tests" }) );
    }
  };

  project.targets[ "compileTests" ] = {
    description: "Compile unit tests",
    depends: [],
    internal: true,
    code: function( bee ) {
      bee.run( bee.tasks.tsc.run({ file: "src/tests/*.ts", outDir: "target" }) );
    }
  };

  project.targets[ "clean" ] = {
    description: "Delete all artifactes which will be created by this project.",
    depends: [],
    code: function( bee ) {
      bee.run( bee.tasks.rmdir.run({ dir: "target" }) );
    }
  };

  project.targets[ "play" ] = {
    description: "Play around with new features.",
    depends: [],
    code: function( bee ) {
      console.log( "play" );
      bee.run( bee.tasks.tsc.run({ outFile: "target/main.js", files: [ "src/person.ts", "src/main.ts" ] }) );
    }
  };

}


