# A minimal javascript/typescript build system for me

To get started:

* drop the script "bee" into the project folder
* run bee

## Run bee

    ./bee

On some systems, it might be necessary to call bee like this:

    node bee

Then follow the messages on screen.

## Alias for regular use

    # in ~/.profile add this line:
    alias bee="./bee"

## Build targets

* Targets are defined in file build.js
* Tasks which can be called in build.js can be listed with "bee -t"

## Goals

* No dependencies apart from nodejs

## Todo

* task: tsc
* task: webserver ..... serve files as http
* task: copy
* nonblocking? futures in exec and other calls?
* check targets and dependencies if they are available before running

## Done

* no parameter should show usage and target list
* target dependencies
* targets instead of scripts

# eof