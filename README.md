TDT4900
=======

The meteor folder is the source code for a MeteorJS application that performs most of the calculation and provides interfaces for exploring the corpus. 

Before the code can be used, MeteorJS must be installed, Node.js with the modules must be installed, 
logiclda and textproc must be built from source, data must be gotten from Norsk Aviskorpus and NHH Børsprosjektet, 
various javascript libraries must be downloaded and put in the client-subdirectory (dc.js, jquery, crossfilter.js, d3.js, bootstrap.js), batch-files must be created that run various
commands , and a machine must be set up according the instructions for Oslo Bergen Tagger (which only works on Linux).

Because of all the work involved in getting this to run on another machine, it is more likely useful in bits. If reusing components for something similar, I would reccommend not using
MeteorJS at all, but instead just using NodeJS. The design patterns of Meteor just got in the way.

The code has simple comments where it may be hard to find specific code.

screen2.jpg is a screengrab from the article/event exploration.