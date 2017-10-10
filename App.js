
app.post("/createDocuments", upload.single("csv"), function (req, res) {
	if (!req.file) {
		return res.status(500).send("missing CSV file");
	}

	let scheme = {	
		"csv": {
			"delimiter": ";",
			"skipHeader": true,
			"map": {
				"id": 0,
				"type": 1,
				"callNumber": 2,
				"callOpenDate": 3,
				"callOpenTime": 4,
				"customerCode": 5,
				"siteName": 6,
				"siteAddress": 7,
				"siteNeighborhood": 8,
				"siteZipcode": 9,
				"siteCity": 10,
				"siteState": 11,
				"productCode": 12,
				"callBranch": 13,
				"callRegion": 14,
				"callStatus": 15,
				"deadlineSolution": 16,
				"onTimeSolution": 17,
				"equipmentType": 18,
				"attendanceType": 19,
				"schedulingDate": 20,
				"schedulingTime": 21,
				"callCloseDate": 22,
				"callCloseTime": 23,
				"callRegional": 24,
				"averageServiceTime": 25,
				"averageRepairTime": 26,
				"averageSolutionTime": 27,
				"action": 28,
				"segmentId": 29,
				"callRegionName": 30,
				"callBranchName": 31,
				"callRegionalName": 32,
				"currentDateTime": 33
			}
		},
		"db_scheme": {
			"collection": "teste",
			"fields": {
				"id": "String",
				"type": "String",
				"callNumber": "String",
				"callOpenDate": "String",
				"callOpenTime": "String",
				"customerCode": "String",
				"siteName": "String",
				"siteAddress": "String",
				"siteNeighborhood": "String",
				"siteZipcode": "String",
				"siteCity": "String",
				"siteState": "String",
				"productCode": "String",
				"callBranch": "String",
				"callRegion": "String",
				"callStatus": "String",
				"deadlineSolution": "String",
				"onTimeSolution": "String",
				"equipmentType": "String",
				"attendanceType": "String",
				"schedulingDate": "String",
				"schedulingTime": "String",
				"callCloseDate": "String",
				"callCloseTime": "String",
				"callRegional": "String",
				"averageServiceTime": "String",
				"averageRepairTime": "String",
				"averageSolutionTime": "String",
				"action": "String",
				"segmentId": "String",
				"callRegionName": "String",
				"callBranchName": "String",
				"callRegionalName": "String",
				"currentDateTime": "String"
			}
		}
	};

	csvToCloudant.exportToDB(req.file, scheme, db ).then(function(result){
		return res.redirect("/crawlerLog");
	});
});

