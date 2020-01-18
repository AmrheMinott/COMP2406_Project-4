// Create express app
const express = require('express');
let app = express();

// Database variables
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let db;

// View engine
app.set("view engine", "pug");

// Set up the routes
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// looks for the public and js files in the current directory
app.use(express.static("."));

// gets the questions from the databse and returns them in either a JSON or HTML form depending on what the clients asked for!
app.get("/questions" , getQuestions);
function getQuestions(req , res , next){
  // gets the query parameter and saves in a usable variable
  let category = req.query.category;
  let difficulty = req.query.difficulty;

  let limit = 25;

  // should I run this code even if the query parameters are null????
  // YES it should be anything really
  if (!category && !difficulty){

    db.collection("questions").find().limit(limit).toArray(function(err,result){
      if(err){
        res.status(500).send("Huoston we have a problem with Questions");
        return;
      }

      let questions = {"questions": result};
      res.format({
        "text/html": () => {res.status(200).render("getQuestions", {qS:questions})},
        "application/json": () => {res.status(200).send(questions)}
      }); // end of res.format
    }); // end of toArray

    // CASE when the category doesn't exists but difficulty exist so we get any category
  } else if (!category && difficulty){

    db.collection("questions").find(
  		{$and : [
  			{difficulty: difficulty},
  		]}).limit(limit).toArray(function(err,result){
        if(err){
          res.status(500).send("Huoston we have a problem with Questions");
          return;
        }

        // object that will have the questions
        let questions = {"questions": result};

        // if there is nothing in the result
        if (result.length == 0){
          console.log("Result is empty! !category && difficulty");
          res.format({
            "text/html": () => {res.status(200).render('getQuestions', {qS:questions})},
            "application/json": () => {res.status(200).send(questions)}
          }); // end of res.format
          return;
        } else {
          console.log("Result has something!");
          res.format({
            "text/html": () => {res.status(200).render("getQuestions", {qS:questions})},
            "application/json": () => {res.status(200).send(questions)}
          }); // end of res.format
        } // end of else
      }); // end of toArray

      // CASE when the difficulty doesn't exists but category exist so we get any difficulty
  } else if (!difficulty && category){

    db.collection("questions").find(
  		{$and : [
  			{category: category},
  		]}).limit(limit).toArray(function(err,result){
        if(err){
          res.status(500).send("Huoston we have a problem with Questions");
          return;
        }

        // object that will have the questions
        let questions = {"questions": result};

        // if there is nothing in the result
        if (result.length == 0){
          console.log("Result is empty! !difficulty && category");
          res.format({
            "text/html": () => {res.status(200).render('getQuestions', {qS:questions})},
            "application/json": () => {res.status(200).send(questions)}
          }); // end of res.format
          return;
        } else {
          console.log("Result has something!");

          res.format({
            "text/html": () => {res.status(200).render("getQuestions", {qS:questions})},
            "application/json": () => {res.status(200).send(questions)}
          }); // end of res.format
        } // end of else
      }); // end of toArray


  } else {
    // CASE when the both category and difficulty exist
    db.collection("questions").find(
  		{$and : [
  			{category: category},
  			{difficulty: difficulty},
  		]}).limit(limit).toArray(function(err,result){
        if(err){
          res.status(500).send("Huoston we have a problem with Questions");
          return;
        }

        // object that will have the questions
        let questions = {"questions": result};

        // if there is nothing in the result
        if (result.length == 0){
          console.log("Result is empty! category && difficulty");
          res.format({
            "application/json": () => {res.status(200).send(questions)},
            "text/html": () => {res.status(200).render('getQuestions', {qS:questions})}
          }); // end of res.format
          return;
        } else {
          console.log("Result has something!");
          res.format({
            "application/json": () => {res.status(200).send(questions)},
            "text/html": () => {res.status(200).render("getQuestions", {qS:questions})}
          }); // end of res.format
        } // end of else
      }); // end of toArray
  } // end of else

}

// gets one question from the database
app.get("/questions/:qID" , getQuestionID);
function getQuestionID(req , res , next){

  // this is the object ID for the question
  let qId;

  // creates a UUID of the sorts, that can used to find that object in the database
	try {
		qId = new mongo.ObjectID(req.params.qID);
    console.log("Question qId " + qId);
	} catch {
		res.status(404).send("This Question ID doesn't exist");
		return;
	}

	db.collection("questions").findOne({"_id":qId}, function(err, questionFound){
    // some error
		if(err){
			res.status(500).send("Opps there was an ERROW reading database my fault!");
			return;
		}
    // ID doesn't exist
		if(!questionFound){
			res.status(404).send("Unknown QUESTION ID provided");
			return;
		}
    // question has been found and we are sending back that question to question.pug
    res.format({
      "text/html": () => {res.status(200).render("questionID", questionFound)},
      "application/json": () => {res.status(200).send(questionFound)}
    }); // end of res.format
	}); // end of findOne
}

// take the user to an html page where they can go and create the quiz
app.get("/createquiz" , createQuiz);
function createQuiz (req , res , next){

  // gets the unique categories AND difficulties from the database
	db.collection("questions").distinct("category", {}, function (err, docs){

		var categories;
		var difficulties;

		if(err){
			return console.log(err);
		}

    // gets me the categories from the database
		if(docs){
			categories = docs;
			// console.log("categories " + categories);
		}

		// gets the distinct difficulties from the database
		// this function is called inside the categories so that we can obtain the difficulties in one go
		db.collection("questions").distinct("difficulty", {}, function (err, docs){

			// there is an error throw
			if(err){
				return console.log(err);
			}

			// this is the unique difficulties of the database (questions)
			if(docs){
				difficulties = docs;
			}

			// this is the object the user will get back with the arrays
			let results = {
				cat:categories,
				dif:difficulties
			}

			console.log("results.cat " + results.cat);
			console.log("results.dif " + results.dif);

      // sends the categories and difficulties in an onbject to the user for use
      res.status(200).json(results); // this for the static html page so it can load the select tags

		}); // end of difficulties

	}); // end of categories

}

// saves the POST made on client side to the database
app.post("/quizzes" , postQuiz);
function postQuiz (req , res , next){

  // gets the quiz object from the req.body using the express.json parser above
  let pQuiz = req.body;
  let id;

  // validation process of data
  // checking if the creator value is of type string
  if (typeof(pQuiz.creator) !== "string"){
    let html = `<html><head><title>Issue When Saving Quiz!</title></head><body>Unfortunately there was an issue!<br><br>Status Code: 500. Check the content of your quiz they don't match the scheme we wanted!</body></html>`;
    res.status(500).send(html);
    return;
  }

  if (typeof(pQuiz.tags) === "object"){
    // checking if the tags value is of type string
    for (t of pQuiz.tags){
      if (typeof(t) !== "string"){
        let html = `<html><head><title>Issue When Saving Quiz!</title></head><body>Unfortunately there was an issue!<br><br>Status Code: 500. Check the content of your quiz they don't match the scheme we wanted!</body></html>`;
  			res.status(500).send(html);
        return;
      }
    }
  } else {
    let html = `<html><head><title>Issue When Saving Quiz!</title></head><body>Unfortunately there was an issue!<br><br>Status Code: 500. Check the content of your quiz they don't match the scheme we wanted!</body></html>`;
    res.status(500).send(html);
    return;
  }


  let inValid = false;
  // checks if the questions is a object
  if (typeof(pQuiz.questions) === "object"){
    // goes through each question checking the the types are what we want them to be
    for (q of pQuiz.questions){
      if (typeof(q.category) !== "string"){
        inValid = true;
        break;
      }
      if (typeof(q.difficulty) !== "string"){
        inValid = true;
        break;
      }
      if (typeof(q.question) !== "string"){
        inValid = true;
        break;
      }
      if (typeof(q.correct_answer) !== "string"){
        inValid = true;
        break;
      }
      if (typeof(q.incorrect_answers) !== "object"){
        inValid = true;
        break;
      }
      for (ic of q.incorrect_answers){
        if (typeof(ic) !== "string"){
          inValid = true;
          break;
        }
      }
    }
  } else {
    let html = `<html><head><title>Issue When Saving Quiz!</title></head><body>Unfortunately there was an issue!<br><br>Status Code: 500. Check the content of your quiz they don't match the scheme we wanted!</body></html>`;
    res.status(500).send(html);
    return;
  }


  if (inValid){
    let html = `<html><head><title>Issue When Saving Quiz!</title></head><body>Unfortunately there was an issue!<br><br>Status Code: 500. Check the content of your quiz they don't match the scheme we wanted!</body></html>`;
    res.status(500).send(html);
    return;
  }

  // gets the collection and adds the quiz
  db.collection("quizzes").insertOne(pQuiz , function(err, adding){

    if(err){
      let html = `<html><head><title>Issue When Saving Quiz!</title></head><body>Unfortunately there was an issue!<br><br>Status Code: 500.</body></html>`;
			res.status(500).send(html);
			return;
		}

    console.log("The quiz has been added! " + adding.insertedId);

    // send back to the client the ID of the quiz they had just created
    res.status(201).send(adding.insertedId);

  }); // end of insertOne

}

// get the quizzes from the database and returns an array either as a JSON or in html format
app.get("/quizzes" , getQuizzes);
function getQuizzes (req , res , next){
  let creator = req.query.creator;
  let tag = req.query.tag;

  // CASE when both creator and tag doesn't exist so we return anything
  if (!creator && !tag){

    db.collection("quizzes").find().toArray(function(err,result){
      if(err){
        res.status(200).send("Huoston we have a problem");
      }

      let quizzes = {"quizzes": result};
      console.log("Quiz person are !creator && !tag");
      console.log(quizzes);
      res.format({
        "text/html": () => {res.status(200).render("getQuizzes", {qZ:quizzes})},
        "application/json": () => {res.status(200).send(quizzes)}
      }); // end of res.format
    }); // end of toArray

    // CASE when the creator doesn't exist but tag exists so we get any creator
  } else if (!creator && tag){

    db.collection("quizzes").find(
      {$or:
        [{tags:tag} , {tags:{$eq:tag.toLowerCase()}} , {tags:{$eq:tag.toUpperCase()}}]
      }).toArray(function(err,result){

      if(err){
        res.status(200).send("Huoston we have a problem with Quizzes");
        return;
      }

      // creates the object that will be sent to the pug page or the json
      let quizzes = {"quizzes": result};

        // if we have nothing
      if (result.length == 0){
        console.log("No quizzes for query !creator && tag");
        res.format({
          "text/html": () => {res.status(200).render('getQuizzes', {qZ:quizzes})},
          "application/json": () => {res.status(200).send(quizzes)}
        });
        return;
      } else {
        console.log("We have some quizzes for you !creator && tag   ");
        // cards that match the specification the user aasked for
        console.log(result[0]);
        res.format({
          "text/html": () => {res.status(200).render("getQuizzes", {qZ:quizzes})},
          "application/json": () => {res.status(200).send(quizzes)}
        }); // end of res.format
      }
    }); // end of toArray

    // CASE when the tag doesn't exist but creator exists so we get any tag
  } else if (creator && !tag){

    db.collection("quizzes").find(
  		{$and : [
  			{creator: {$regex:creator, $options: "i"}},
  		]}).toArray(function(err,result){
        if(err){
          res.status(200).send("Huoston we have a problem with Quizzes");
          return;
        }

        // creates the object that will be sent to the pug page or the json
        let quizzes = {"quizzes": result};

        // if we have nothing
        if (result.length == 0){
          console.log("No quizzes for query creator && tag!");
          res.format({
            "text/html": () => {res.status(200).render('getQuizzes', {qZ:quizzes})},
            "application/json": () => {res.status(200).send(quizzes)}
          }); // end of res.format
          return;
        } else {
          console.log("We have some quizzes for you creator && tag!");
          // cards that match the specification the user aasked for
          console.log(result[0]);
          res.format({
            "text/html": () => {res.status(200).render("getQuizzes", {qZ:quizzes})},
            "application/json": () => {res.status(200).send(quizzes)}
          }); // end of res.format
        }
      }); // end of toArray

  } else {
    // CASE when the both creator and tag exist
    db.collection("quizzes").find(
  		{$and : [
  			{creator: {$regex:creator, $options: "i"}},
        {$or:
          [{tags:tag} , {tags:{$eq:tag.toLowerCase()}} , {tags:{$eq:tag.toUpperCase()}}]}
  		]}).toArray(function(err,result){
        if(err){
          res.status(200).send("Huoston we have a problem with Quizzes");
          return;
        }

        // creates the object that will be sent to the pug page or the json
        let quizzes = {"quizzes": result};

        // if we have nothing
        if (result.length == 0){
          console.log("No quizzes for query!");
          res.format({
            "text/html": () => {res.status(200).render('getQuizzes', {qZ:quizzes})},
            "application/json": () => {res.status(200).send(quizzes)}
          }); // end of res.format
          return;
        } else {
          console.log("We have some quizzes for you!");
          // cards that match the specification the user aasked for
          console.log(result[0]);
          res.format({
            "text/html": () => {res.status(200).render("getQuizzes", {qZ:quizzes})},
            "application/json": () => {res.status(200).send(quizzes)}
          }); // end of res.format
        } // end of else
      }); // end of toArray
  }

}

// gets a specfic quiz from the database using the ID in params arguement of the URL
app.get("/quiz/:quizID" , getQuiz);
function getQuiz (req , res ,next){

  let qUId;

  // creates a UUID of the sorts, that can used to find that object in the database
	try {
		qUId = new mongo.ObjectID(req.params.quizID);
	} catch {
		res.status(404).send("Unknown object QUIZ ID");
		return;
	}

  console.log("Quiz ID os  " + qUId);

	db.collection("quizzes").findOne({"_id":qUId}, function(err, quizFound){
		if(err){
			res.status(500).send("Opps there was an ERROW reading database my fault!");
			return;
		}
		if(!quizFound){
			res.status(404).send("Unknown QUIZ ID");
			return;
		}
    // Quiz has been found and we are sending back that question to getQuizID.pug
    res.format({
      "text/html": () => {res.status(200).render("getQuizID", quizFound)},
      "application/json": () => {res.status(200).send(quizFound)}
    }); // end of res.format
  }); // end of findOne
}

// Initialize database connection
MongoClient.connect("mongodb://localhost:27017/",{ useUnifiedTopology: true }, function(err, client) {
  if(err) throw err;

  //Get the t8 database
  db = client.db('a4');

  // Start server once Mongo is initialized
  app.listen(3000);
  console.log("Listening on port 3000");
});

// end of program
