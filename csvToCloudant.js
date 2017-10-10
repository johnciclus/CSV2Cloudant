/**
 * Created by johnciclus on 7/02/17.
 **/
(function () {
	"use strict";

	const fs = require("fs");
	const csvTransform = require("csv-to-json-stream");
	const stream = require("stream");
	const Transform = stream.Transform;
	const transformStream = new Transform({
		transform(chunk, encoding, callback) {
			callback(null, chunk);
		}
	});
	let log = [];

	let methods = {
		loadCollections: function (db){
			let collections = [];
			let query = {
				"selector": {
					"_id": {
						"$gt": 0
					}
				}
			};
			return db.role.get(query).then(function(roles) {
				let rolesMap = {};
				roles.docs.forEach(function (role) {
					rolesMap[role.name.toLowerCase()] = role;
				});
				collections["role"] = rolesMap;

				return db.territory.get(query).then(function (territories) {
					let territoriesMap = {};
					territories.docs.forEach(function (territory) {
						territoriesMap[territory.name.toLowerCase()] = territory;
					});
					collections["territory"] = territoriesMap;
					return collections;
				});
			});
		},
		saveDocuments: function (db, scheme, documents){
			return new Promise(function (resolve, reject) {
				db[scheme.db_scheme.collection].createMany({ docs: documents}).then(function(response){
					console.log("Response: "+response.length+" documents created");
					log.push("Response: "+response.length+" documents created");
					resolve();
				}).catch(function (error){
					reject(error);
				});
			});
		}
	};

	module.exports =  {
		"exportToDB": function (file, scheme, db) {
			return new Promise(function (resolve, reject) {
				methods.loadCollections(db).then(function(collections){
					const bulkSize = 1000;
					let count = 0;
					let documents = [];
					let initialTime = Date.now();
					let fields = scheme.db_scheme.fields;
					log = [];

					transformStream.on("data", function(chunk){
						if (documents.length < bulkSize){
							let document = JSON.parse(chunk.toString());

							Object.keys(document).forEach(function (key) {
								let field = fields[key];
								if (field && field.type && document[key] && document[key] !== "") {
									if (field.type === "Reference") {
										document[key] = collections[field.collection.toLowerCase()][document[key].toLowerCase()];
									}
									if (field.type === "ReferencesArray") {
										let references = document[key];
										document[key] = [];
										references.split(",").forEach(function(reference){
											document[key].push(collections[field.collection.toLowerCase()][reference.trim().toLowerCase()]);
										});
									}
								}
							});
							documents.push(document);
							count++;
						}
						if (documents.length === bulkSize){
							let self = this;
							self.pause();
							console.log(count);
							log.push(count + " documents loaded");
							methods.saveDocuments(db, scheme, documents).then(function(){
								self.resume();
								documents = [];
							});
						}
					});

					fs.createReadStream(file.path)
					.on("end", function () {
						console.log(count);
						log.push(count + " documents loaded");
						methods.saveDocuments(db, scheme, documents).then(function(){
							documents = [];
						});
					})
					.on("close", function(){
						log.push("Total time:" +(Date.now()-initialTime));
						console.log("Total time:" +(Date.now()-initialTime));
					})
					.on("error", function(err){
						console.log("error"+err);
						console.log(err);
					})
					.pipe(csvTransform(scheme.csv))
					.pipe(transformStream);

					resolve();
				}).catch(function (error){
					reject(error);
				});
			});
		},
		"getScheme": function(){
			return new Promise(function (resolve, reject) {
				fs.readFile(__dirname+"/../../client/etc/schemes/users_scheme.json", "utf8", function(err, data) {
					if (err) reject(err);
					resolve({"data": data});
				});
			});
		},
		"getStatus": function(){
			return {"log": log}
		}
	}
	/*


	module.exports =  {
		"transform": function (path, scheme, db) {
				return new Promise(function (resolve, reject) {

						console.log(collections);
						let documents = [];
						let documentsPromises = [];
						let fields = scheme.db_scheme.fields;

						const transformStream = new Transform({
							transform(chunk, encoding, callback) {
								callback(null, chunk);
							}
						});

						transformStream.on("data", function (chunk) {
							documentsPromises.push(new Promise(function (resolveDocument) {
								let document = JSON.parse(chunk.toString());

								Object.keys(document).forEach(function (key) {
									let field = fields[key];
									if (field && field.type && document[key] && document[key] !== "") {
										if (field.type === "Reference") {
											document[key] = collections[field.collection.toLowerCase()][document[key].toLowerCase()];
										}
										if (field.type === "ReferencesArray") {
											let references = document[key];
											document[key] = [];
											references.split(",").forEach(function(reference){
												document[key].push(collections[field.collection.toLowerCase()][reference.trim().toLowerCase()]);
											});
										}
									}
								});

								documents.push(document);
								resolveDocument(document);
							}));
						});
				});

			});
		}
	}
	*/
}());