# A minimal javascript/typescript build system for me

To get started:

* drop the script "tsb" into the project folder
* run tsbuild

## Run tsbuild

    ./tsb

On some systems, it might be necessary to call tsbuild like this:

    node tsb

Then follow the messages on screen.

## Alias for regular use

    # in ~/.profile add
    alias tsb="./tsb"

## Goals

* No dependencies apart from nodejs

## Todo

* task: tsc
* task: webserver ..... serve files as http
* task: copy
* nonblocking? futures in exec and other calls?
* check tasks and dependencies if they are available before running

## Done

* no parameter should show usage and task list
* task dependencies
* tasks instead of scripts
