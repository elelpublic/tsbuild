exports.setup = function( project ) {

  project.name = "bee";
  project.description = "An antlike builder for nodejs and especially for me.";
  project.defaultTarget = "build";

  project.targets[ "build" ] = {
    description: "Build the project, create distribution files.",
    depends: [ ],
    code: function( bee ) {
      bee.run( bee.tasks.tsc.run( bee, { outFile: "target/bee", files: [ 
        "src/main/tsunit.ts",
        "src/main/reportconfig.ts",
        "src/main/testresult.ts",
        "src/main/tasks.ts", 
        "src/main/cli.ts",
        "src/main/bee.ts" 
      ] } ) );
      bee.run( bee.tasks.file2string.run( bee, { input: "src/main/testresult.css", output: "target/css.ts" } ) );
    }
  };

  project.targets[ "install" ] = {
    description: "Install new version of bee in this project.",
    depends: [ "test" ],
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
      bee.run( bee.tasks.tsc.run( bee, { file: "src/test/DemoCode.ts", outDir: "target" }) );
      bee.run( bee.tasks.exec.run( bee, { command: "cp src/test/DemoTest.js target" }) );
      bee.run( bee.tasks.exec.run( bee, { command: "cp src/main/testresult.css target" }) );
    }
  };

  project.targets[ "test" ] = {
    description: "Run unit tests",
    depends: [ "build", "compileTests" ],
    code: function( bee ) {
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

}


