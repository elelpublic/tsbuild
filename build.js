exports.setup = function( project ) {

  project.name = "bee";
  project.description = "An antlike builder for nodejs and especially for me.";
  project.defaultTarget = "build";

  project.targets[ "build" ] = {
    description: "Build the project, create distribution files.",
    depends: [ "test" ],
    code: function( bee ) {
      bee.tasks.tsc.run( bee, { outFile: "target/bee", files: [ "src/main/tasks.ts", "src/main/bee.ts" ] });
//      bee.tsc.run(  bee, { file: "src/*.ts", outDir: "target" } );
    }
  };

  project.targets[ "install" ] = {
    description: "Install new version of bee in this project.",
    depends: [ "build" ],
    code: function( bee ) {
      bee.run( bee.tasks.exec.run( bee, { command: "echo 'Will install bee.ts as bee.'" } ) );
      bee.run( bee.tasks.exec.run( bee, { command: "cp target/bee bee" } ) );
      bee.run( bee.tasks.exec.run( bee, { command: "echo 'Installation finished.'" } ) );
    }
  };

  project.targets[ "compileTests" ] = {
    description: "Compile unit tests",
    depends: [],
    internal: true,
    code: function( bee ) {
      bee.run( bee.tasks.tsc.run( bee, { file: "src/tests/DemoCode.ts", outDir: "target" }) );
      bee.run( bee.tasks.exec.run( bee, { command: "cp src/tests/DemoTest.js target" }) );
    }
  };

  project.targets[ "test" ] = {
    description: "Run unit tests",
    depends: [ "compileTests" ],
    code: function( bee ) {
      //bee.exec.run( "src/tests/alltests.js" );
      //bee.run( bee.tasks.test.run( bee, { test: "testMath" }) );
      bee.run( bee.tasks.test.run( bee, { file: "target/DemoTest.js" }) );
    }
  };

  project.targets[ "clean" ] = {
    description: "Delete all artifactes which will be created by this project.",
    depends: [],
    code: function( bee ) {
      bee.run( bee.tasks.rmdir.run( bee, { dir: "target" }) );
    }
  };

  project.targets[ "play" ] = {
    description: "Play around with new features.",
    depends: [],
    code: function( bee ) {
      console.log( "play" );
      bee.run( bee.tasks.tsc.run( bee, { outFile: "target/main.js", files: [ "src/person.ts", "src/main.ts" ] }) );
    }
  };

  // project.tests[ "testMath" ] = {
  //   description: "Test the math class.",
  //   code: function( bee ) {
  //     console.log( "This is a test, bee: " + bee );
  //   }
  // }

}


