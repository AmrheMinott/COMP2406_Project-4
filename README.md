# Project4README

Amrhe Minott
Student Number: 101107093


OVERVIEW
Project gives you the user the ability to create your own quiz by gathering an assortment of questions from a mongo database and create a quiz object that can be saved to the database that can be retrieved easily.

We mainly support the creating and retrieving of data. None of the other CRUD functionalities are taken into account


/****URL ROUTES****/

GET
questions			=> returns a total of 25 questions from from database
questionID			=> we get the specific question from the database
quizzes				=> we get all the quizzes form the server that meet the parameter for creator and tag
quizID				=> we get a specific quiz Id from the database
createQuiz			=> this loads on the select tags the values of the distinct category and difficulty

POST
quizzes	=> this is the route that allows for the user to save their data to the MONGO database


DO npm install in the folder given
this gives the node modules you will need


/****SETUP PROCESS****/

Running MONGODB for the quizzes and question Database server file

This folder will contain the following
	1. serverP4.js
	2. index.html
	3. a folder named “views” with the pug files
	4. createQuizScript.js
	5. database initializer.js
	6. package.json

Step One mongod --dbpath=P4-data
	This process should be done in it own terminal/cmd window
	ensure you are in the folder Project-4 then execute the code seen above
	mongod -—dbpath=P4-data

So if main is called “some folder” then the P4-data folder should be in there as well
Then it is safe to execute mongod -—dbpath=P4-data

There should appear some “.wt files” in the folder P4-data

Step Two mongo
	open a new terminal then call mongo

Step Three node database-initializer.js
	navigate to the Project-4 folder and call node database-initializer.js
	This creates the files you will need for the questions

Step Four node serverP4.js
	navigate to the Project-4 folder and call node serverP4.js



/****Important details to to know****/
Querying for tags array of the quizzes collection

	The query parameter for the tag accepts a single string this string or “tag” is used to find all the quizzes in the database that contains that particular tag in the tags array of that quiz document

Also to accomplish the task of example
tag = dog –> to get this working for cases DOG and dog I did not use regex so I found a different way
		Additionally my code accounts for doG, DoG, and pretty all permutations of dog as common and capital letters

ADDITIONALLY my interpretation of the get quizzes for the tags is that the there is only one tag needed for the querying

So for a generic tags array [apple , berry , dog]    [ apple , bat , dog ]  [ apple , bat , mat ]

when you enter dog/DOG/DoG/Dog as a tag that gives  =>  [apple , berry , dog]    [ apple , bat , dog ]




index.html and createQuizScript.js

for the add and remove
When the user makes a add / remove that operation is a one time event
meaning when the user selects that question that question is disabled

the only way our user can add sed question is to make the call to the server again by changing the select tags and re load the question. Then select it assuming the question is not already in the quizQuestions div

INDEX.html Tags
For the tags you must add at least two tags

following the format
	tag1 tag2
or you can do one tag followed by a blank space



Redirecting
My redirect occurs when the user saves the quiz and is given a link to click. The link is a button the user is asked to click that will take them to the new page with the quiz they had created.
This is possible because my server sends back to _id that MONGO made to the user so they can navigate to that page


DATA VALIDATION
When data is saved the validation process makes use of the typeof function.
It is expected that data be given in the following format

creator						=> string

tags						=> object
	elements of tags				=> string
questions					=> object

elements of the questions go as follows

category						=> string
difficulty						=> string
question						=> string
correct_answer						=> string
incorrect_answers					=> object
	elements of incorrect_answer				=> string
