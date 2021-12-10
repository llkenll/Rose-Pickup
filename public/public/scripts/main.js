
var rhit = rhit || {};



rhit.FB_COLLECTION_SPORT = "Sports";

rhit.FB_KEY_SPORTNAME = "sport";

rhit.FB_COLLECTION_EVENTS = "allAvailableEvents";

rhit.FB_COLLECTION_PHOTOS = "photos";
rhit.FB_KEY_REOCCURENCE = "isReoccuring";

rhit.FB_KEY_END_TIME = "endTime";
rhit.currentUserName = "";
rhit.FB_COLLECTION_USEREVENTS = "userEvent";

rhit.FB_COLLECTION_USERS = "Users";
rhit.FB_KEY_NAME = "name";
rhit.FB_KEY_PHOTO_URL = "photoUrl";
rhit.FB_KEY_MEMBER_BY_ID = "membersById"
rhit.FB_KEY_TITLE = "title";
rhit.FB_KEY_LOCATION = "location";
rhit.FB_KEY_DETAIL = "detail";
rhit.FB_KEY_SPORT = "sport";
rhit.FB_KEY_DATE = "date";
rhit.FB_KEY_IMGPATH = "imagePath";
rhit.FB_KEY_AUTHOR = "author";



rhit.CURRENT_PERSON = "";

rhit.fbMembersDataManager = null;
rhit.fbSportsPageManager = null;
rhit.fbAuthManager = null;
rhit.fbUserManager = null;
rhit.fbAllEventManager = null;
rhit.fbUserDataManager = null;
rhit.fbEventDetailManager = null;
rhit.fbMembersManager = null;
rhit.fbgetMember = null;
rhit.fbUserData = null;

rhit.FB_KEY_ALL_USER__PHOTO_URL = "UserPhotoUrls"

rhit.convertNumToMonth = function(num){
	let months = [ "January", "February", "March", "April", "May", "June", 
	   "July", "August", "September", "October", "November", "December" ];

	return months[num];
}

rhit.convertDate = function(input){
	
	const date = new Date(input.seconds*1000);
	
		
		let dayOfWeek = "";
		
		if(String(date.getDay()) == "1"){
			dayOfWeek = "Monday";
		}else if(String(date.getDay())  == "2"){
			dayOfWeek = "Tuesday";
		}else if(String(date.getDay())  == "3"){
			dayOfWeek = "Wedensday";
		}else if(String(date.getDay()) == "4"){
			dayOfWeek = "Thursday";
		}else if(String(date.getDay())  == "5"){
			dayOfWeek = "Friday";
		}else if(String(date.getDay())  == "6"){
			dayOfWeek = "Saturday";
		}else if(String(date.getDay()) == "7"){
			dayOfWeek = "Sunday";
		}
		

		let time = date.toTimeString();
		let arr = time.split(":");
		


		let hour = 0;
		let m = "am";

		if(parseInt(arr[0]) > 12){
			hour = parseInt(arr[0])-12;
			m = "pm";
		}else{
			hour = parseInt(arr[0]);
		}
		
		let hourAndMin = hour + ":" + arr[1] + " "+ m;

		let res = dayOfWeek + ", "+this.convertNumToMonth(date.getMonth())+" "+date.getDate()+" "+hourAndMin;
		return res;
	
}


//From https://stackoverflow.com/question/494143/creating-a-new-dom-element
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}


rhit.sport = class{
	constructor(id, name){
		this.id = id;
		this.name = name;
	}
}

rhit.SportsPageController = class{
	constructor(){

		
		//add custom sports

		//modal settings
		document.querySelector("#submitAddSport").addEventListener("click", (event) => {
			const sport = document.querySelector("#inputSport").value;
			rhit.fbSportsPageManager.add(sport);
		})

		$("#addSport").on("show.bs.modal", (event) => {
			//pre animation
			document.querySelector("#inputSport").value = "";
		});
		$("#addSport").on("shown.bs.modal", (event) => {
			//post animation
			document.querySelector("#inputSport").focus();

		});



		rhit.fbSportsPageManager.beginListening(this.updateSportsList.bind(this));
	}


	_createElem(sport){

		return htmlToElement(
			
	`<div class = "row col-12 col-sm-6 col-md-4 justify-content-center">
		<button type="button" id = "${sport.id}" class="btn sports">${sport.name}</button>
    </div>`);
	}
	
	

	updateSportsList(){
		const newList = htmlToElement('<div id = "sportBtnContainer" class = "row justify-content-center">');
		for(let i = 0 ;i < rhit.fbSportsPageManager.length; i++){
			const e = rhit.fbSportsPageManager.getSportAtIndex(i);
			const newSport = this._createElem(e);

			newSport.addEventListener("click",(event) => {
				window.location.href = `/selectedSportPage.html?sport=${e.name}`
			});

			newList.appendChild(newSport);
		}
			
		const oldList = document.querySelector("#sportBtnContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		
		oldList.parentElement.appendChild(newList);


	}

}

rhit.FbSportsPageManager = class{
	constructor(){

		
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_SPORT);
		this.unsubscribe = null;

	}

	add(sport){
		this._ref.add({
		[rhit.FB_KEY_SPORTNAME]: sport,
		})
		.then(function (docRef) {
			console.log("Document written with ID", docRef.id);
		})
		.catch(function (error) {
			console.error("Error adding document", error);
		});
	}

	beginListening(changeListener){
		this.unsubscribe = this._ref
		.limit(20)
		.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
		// 	querySnapshot.forEach((doc) => {
        //     console.log(doc.data());
        // });

		if(changeListener){
			changeListener();
		}
		});

		
	}

	stopListening(){
		this._unsubscribe();
	}

	

	getSportAtIndex(index){
		const doc = this._documentSnapshots[index];
		console.log(doc);

		const newSport = new rhit.sport(
			doc.id,
			doc.get(rhit.FB_KEY_SPORTNAME)
		);

		return newSport;
		
	}


	get length(){
		return this._documentSnapshots.length;
	}
}
//end 


//login page 
rhit.LoginPageController = class{
	constructor(){
		document.querySelector("#roseFireBtn").onclick = (event) => {
			rhit.fbAuthManager.signIn();
			
		};
	}
}

rhit.FbAuthManager = class{
	constructor(){
		this._user = null;
		this._name = null;
		this._photoUrl = "";
	}


	beginListening(changeListener) {
	  
		firebase.auth().onAuthStateChanged((user) => {
	
			this._user = user;
			changeListener();
	
			
		  });
	}

	signIn(){
		
		Rosefire.signIn("06947101-2239-4773-8037-eada366e60ab", (err, rfUser) => {
			if (err) {
			  console.log("Rosefire error!", err);
			  return;
			}
			console.log("Rosefire success!", rfUser);
			this._name = rfUser.name;
			firebase.auth().signInWithCustomToken(rfUser.token)
			.catch((error) => {
			  const errorCode = error.code;
			  const errorMessage = error.message;

			  if(errorCode === 'auth/invalid-custom-token'){
				  alert('The token you provided is not valid.');
			  }else{
				  console.error("custom auth error", errorCode, errorMessage)
			  }
			  // ...
			});
		  
		});
	}

	signOut(){
		firebase.auth().signOut(); 
	}

	get uid() {   


		return this._user.uid; 
	}
	get isSignedIn() {   return !!this._user }

	get name(){
		return this._name
	}

	get photoUrl(){
		return this._photoUrl;
	}
   
}


rhit.FbAllEventManager = class{
	constructor(sport, uid, ujoinedEvent){
		this._uid = uid;
		this._sport = sport;
		this._ujoinedEvent = ujoinedEvent;
		this._documentSnapshots = [];
	  	this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_EVENTS);
		this._userDocument = null;

	}

	//alleventHere
	//add add image functionality
	add(title, detail, location, sport, date, img, id, reoccuringValue, endTime){

		let membersById = ["",rhit.fbAuthManager.uid]
		this._ref.add({
			[rhit.FB_KEY_TITLE]: title,
			[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
			[rhit.FB_KEY_DETAIL]:detail,
			[rhit.FB_KEY_DATE]:date,
			[rhit.FB_KEY_LOCATION]:location,
			[rhit.FB_KEY_SPORT]:sport,
			[rhit.FB_KEY_IMGPATH]:img,
			[rhit.FB_KEY_AUTHOR]:id,
			[rhit.FB_KEY_MEMBER_BY_ID]:membersById,
			[rhit.FB_KEY_REOCCURENCE]:reoccuringValue,
			[rhit.FB_KEY_END_TIME]:endTime

		})
		.then((docRef) => {
			console.log("Document written with ID: ", docRef.id);
		})
		.catch((error) => {
			console.error("Error adding document: ", error);
		});

	
	}

	beginListening(changeListener){
		

		let query = this._ref.orderBy(rhit.FB_KEY_DATE).limit(9);

		const collectionRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
		const userRef = collectionRef.doc(rhit.fbAuthManager.uid);

		if(this._uid){
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}

		if(this._sport){
			query = query.where(rhit.FB_KEY_SPORT, "==", this._sport);
		}

		if(this._ujoinedEvent){	

			query = query.where(rhit.FB_KEY_MEMBER_BY_ID, "array-contains",rhit.fbAuthManager.uid);
			console.log(query);

		}

		this._unsubscribe = query
		.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
      

		

		userRef.onSnapshot((doc) => {
			if (doc.exists) {
				this._userDocument= doc;
			}
			
		});


		
		

	

		if(changeListener){
			changeListener();
		}

		
		
    	});

	}
	stopListening() {   

		this._unsubscribe();
	}

	// update(id, quote, movie) {    }
	// delete(id) { }
	get length() {  

		return this._documentSnapshots.length;
	}


	getEventAtIndex(index){
		const docSnapShot = this._documentSnapshots[index];
		const event = new rhit.event(
			docSnapShot.id,
			docSnapShot.get(rhit.FB_KEY_TITLE),
			docSnapShot.get(rhit.FB_KEY_DETAIL),
			docSnapShot.get(rhit.FB_KEY_LOCATION),
			docSnapShot.get(rhit.FB_KEY_SPORT),
			docSnapShot.get(rhit.FB_KEY_DATE),
			docSnapShot.get(rhit.FB_KEY_IMGPATH),
			docSnapShot.get(rhit.FB_KEY_REOCCURENCE),
			docSnapShot.get(rhit.FB_KEY_END_TIME)
		);


		return event;
	}

	delete(index) {
		const docSnapShot = this._documentSnapshots[index];
		const id = docSnapShot.id;
		const eventRef = this._ref.doc(id);
		return eventRef.delete();
	}


	updateDate(index, date){
		const docSnapShot = this._documentSnapshots[index];
		const id = docSnapShot.id;
		const eventRef = this._ref.doc(id)

		eventRef.update({
			[rhit.FB_KEY_DATE]:date

		})

		//gobacj
	}


	
}



rhit.convertToDay = function(input){
	if(input == "Mon"){
		return 1;
	}else if(input == "Tue"){
		return 2
	}else if(input == "Wed"){
		return 3;
	}else if(input == "Thu"){
		return 4;
	}else if(input == "Fri"){
		return 5;
	}else if(input == "Sat"){
		return 6;
	}else if(input == "Sun"){
		return 7;
	}
}


rhit.allEventPageController = class{
	constructor(){
	
		rhit.fbAllEventManager.beginListening(this.updateView.bind(this));

		document.querySelector("#fab").style.visibility ="visible";

		const urlParams = new URLSearchParams(window.location.search);
		const uid = urlParams.get("uid");
		if(uid){
			document.querySelector(".navbar-brand").innerHTML = "Events Created";
			document.querySelector("#fab").style.visibility ="hidden";
		}

		const urlParams2 = new URLSearchParams(window.location.search);
		const uEventJoined = urlParams2.get("userEventJoined");
		if(uEventJoined){
			document.querySelector(".navbar-brand").innerHTML = "Events Joined";
			document.querySelector("#fab").style.visibility ="hidden";
		}

		document.querySelector("#fab").addEventListener("click",(event) => {
			document.querySelector("#errorMsg").style.visibility = "hidden";
			document.querySelector("#errorTitle").style.visibility = "hidden";
			document.querySelector("#errorLocation").style.visibility = "hidden";
			document.querySelector("#errorDetail").style.visibility = "hidden";
			document.querySelector("#errorNoTime").style.visibility = "hidden";
		})

		

		
		// document.querySelector("#submit").addEventListener("submit",(event) => {
			let res = "https://www.rose-hulman.edu/about-us/community-and-public-services/communications-and-marketing/assets/RH_G_HiRes-RGB-1c.png";
		// })
		document.querySelector("#inputImg").addEventListener("change",(event) => {
				const file = event.target.files[0];
				
			//document.querySelector("#submit").addEventListener("click",(event) => {
				const metadata = {
					"content-type": file.type
				  };
			  
				  //    const storageRef = firebase.storage().ref().child(rhit.FB_COLLECTION_USERS).child(rhit.fbAuthManager.uid);
				  firebase.firestore().collection(rhit.FB_COLLECTION_PHOTOS).add({})
					.then((docRef) => {
					  console.log("Blank document written with ID: ", docRef.id);
					  const nextAvailableKey = docRef.id;
					  const storageRef = firebase.storage().ref().child(rhit.FB_COLLECTION_PHOTOS).child(nextAvailableKey);
					  console.log("Ready to upload the file to: ", storageRef);
					  storageRef.put(file, metadata).then((uploadSnapshot) => {
						console.log("Upload is complete!", uploadSnapshot);
						storageRef.getDownloadURL().then((downloadURL) => {
						  console.log("File available at", downloadURL);
						  // TODO: Update a Firestore object with this download URL.
						  res = downloadURL;
						});
					  });
			  
					  
					  console.log("Uploading", file.name);
					});
			//})
			
		})

		let value = false;


			document.querySelector('#isReoccuring').addEventListener("click",(event) => {
				value = !value;
				document.querySelector('#isReoccuring').value = value;

				
			})
			

		

		document.querySelector("#submitCreateEvent").dataset.dismiss = "";

		
		document.querySelector("#submitCreateEvent").addEventListener("click",(event) => {
			let dataValid = true;
			document.querySelector("#errorTitle").style.visibility = "hidden";
			document.querySelector("#errorLocation").style.visibility = "hidden";
			document.querySelector("#errorDetail").style.visibility = "hidden";
			document.querySelector("#errorNoTime").style.visibility = "hidden";
			


			const title = document.querySelector("#inputTitle").value;
			const location = document.querySelector("#inputLocation").value;
			const urlParams = new URLSearchParams(window.location.search);
			const sport = urlParams.get("sport");
			const detail = document.querySelector("#inputDetail").value;

			

			let time = document.querySelector("#inputDate").value;
			let eTime= document.querySelector("#endTime").value;
		

			let dateTimeStr = String(time);
			let dateObj = new Date(dateTimeStr);


			
			
			let eTimeArr = eTime.split(":");
		

			let dateArr = dateObj.toString().split(" ");
			let dateTimeArr = dateArr[4].split(":");
			let endTimeEnding = "pm";
			let dateTimeEnding = "pm";

			console.log(eTimeArr[0] ,dateTimeArr[0])
			if(parseInt(eTimeArr[0]) < 12){
				endTimeEnding = "am";
			}

			if(parseInt(dateTimeArr[0]) < 12){
				dateTimeEnding = "am";
			}

			
			if(title == ""){
				
				document.querySelector("#errorTitle").style.visibility = "visible";
				dataValid = false;
			}

			if(location == ""){
				document.querySelector("#errorLocation").style.visibility = "visible";
				dataValid = false;
			}


			
				

			if(detail == ""){
				document.querySelector("#errorDetail").style.visibility = "visible";
				dataValid = false;
			}
		
			if(eTime == ""){
				document.querySelector("#errorNoTime").style.visibility = "visible";
				dataValid = false;
				
			}

			

			if(endTimeEnding == dateTimeEnding){
				if(parseInt(eTimeArr[0]) < dateTimeArr[0]){

					console.log("error");
					document.querySelector("#errorMsg").style.visibility = "visible";
					dataValid = false;
	
				}else if(parseInt(eTimeArr[0]) == dateTimeArr[0]){
					if(parseInt(eTimeArr[1]) < dateTimeArr[1]){
						console.log("error");
						document.querySelector("#errorMsg").style.visibility = "visible";
						dataValid = false;
					}
				}else{
					document.querySelector("#errorMsg").style.visibility = "hidden";
	
				}
				
			}




			console.log(dataValid);

		

			let message=`you have just created event ${title}, which is set for ${dateObj.toString()}.`;
			//sendMail(rhit.fbAuthManager.uid,message );
			console.log(message);

			//send Mail


		
			if(dataValid){
				document.querySelector("#submitCreateEvent").dataset.dismiss = "modal";
				rhit.fbAllEventManager.add(
					title,
					detail,
					location,
					sport,
					dateObj,
					res,
					rhit.fbAuthManager.uid,
					value,
					eTime
				);
			}
		})

		
	}
	

	  
	//   $("#filePhoto").change(function() {
	// 	readURL(this);
	//   }

	

	convertNumToMonth(num){
		let months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];

		return months[num];
	}

	//change later to add image
	_createCard(event){
		
		const date = new Date(event.date.seconds*1000);
		
		let dayOfWeek = "";

		

		if(String(date.getDay()) == "1"){
			dayOfWeek = "Mon";
		}else if(String(date.getDay())  == "2"){
			dayOfWeek = "Tues";
		}else if(String(date.getDay())  == "3"){
			dayOfWeek = "Wed";
		}else if(String(date.getDay()) == "4"){
			dayOfWeek = "Thur";
		}else if(String(date.getDay())  == "5"){
			dayOfWeek = "Fri";
		}else if(String(date.getDay())  == "6"){
			dayOfWeek = "Sat";
		}else if(String(date.getDay()) == "7"){
			dayOfWeek = "Sun";
		}

		let time = date.toTimeString();
		let arr = time.split(":");



		let hour = 0;
		let m = "am";

		if(parseInt(arr[0]) > 12){
			hour = parseInt(arr[0])-12;
			m = "pm";
		}else{
			hour = parseInt(arr[0]);
		}
		
		if(hour == 0){
			hour = 12;
		}
		let hourAndMin = hour + ":" + arr[1] + " "+ m;
	


		return htmlToElement(`<div class = "col-12 col-md-4 justify-content-center mb-5">
		<div class="card">
		  <div class="card-body">
		  <img
        src="${event.imgPath}"
        alt="${event.title}"
		class="eventImg img-fluid">
			<h5 class="pb-0 card-title">${event.title}</h5>
			<h4 class="card-subtitle mb-2 text-muted">${dayOfWeek} ${this.convertNumToMonth(date.getMonth())} ${date.getDate()}</h6>
			<h4 class="card-subtitle mb-2 text-muted">${hourAndMin}</h6>

		  </div>
		</div>
	  </div>`)
	}

	updateView(){


		//update the calender to current date and one month ahead. 
		
		let today = new Date();
		// 2021-10-25T08:30
		

		let dateString = `${String(today.getFullYear())}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
		let min = `${String(today.getFullYear())}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T00:00`;
		let max = `${String(today.getFullYear())}-${String(today.getMonth() + 3).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T00:00`;
		document.querySelector("#inputDate").value = dateString;
		document.querySelector("#inputDate").max = max;
		document.querySelector("#inputDate").min = min;	
		const urlParams = new URLSearchParams(window.location.search);
		const uid = urlParams.get("uid");

		const urlParams2 = new URLSearchParams(window.location.search);
		const uEventJoined = urlParams2.get("userEventJoined");

		if(!uid && !uEventJoined){
			const sport = rhit.fbAllEventManager._sport;
			console.log(sport);
			document.querySelector(".navbar-brand").innerHTML = sport;
			document.querySelector("#title").innerHTML = sport;
		}
		
		const newList = htmlToElement('<div id = "eventContainer" class = "row justify-content-center"></div>');

		for(let i = 0 ; i < rhit.fbAllEventManager.length; i++){
			const eventElem = rhit.fbAllEventManager.getEventAtIndex(i);

			//check for outdate events

			
				
			let isTrash = false;
			if(!eventElem.isReoccuring){
				console.log("deleting if needed");
				const eventDate = eventElem.date;
				const date = new Date(eventDate.seconds*1000);
				const dateArr = date.toString().split(" ");
				let today = new Date();
				let todayArr = today.toString().split(" ");
				let endTimeArr = eventElem.endTime.toString().split(":");

				let ifSameYear = true;
				let ifSameMonth = true;


				if(todayArr[3] > dateArr[3]){
					rhit.fbAllEventManager.delete(i).then(() => {
						console.log("Document successfully deleted!");
						isTrash = true;
					}).catch((error) => {
						console.error("Error removing document: ", error);
					});
					ifSameYear = false;
				}



				//if month greater
				if(ifSameYear){
					if(todayArr[1] > dateArr[1]){
						rhit.fbAllEventManager.delete(i).then(() => {
							console.log("Document successfully deleted!");
							isTrash = true;
						}).catch((error) => {
							console.error("Error removing document: ", error);
						});
						ifSameMonth = false;
					}
				}


				if(ifSameMonth){
					if(todayArr[2] > dateArr[2]){
						rhit.fbAllEventManager.delete(i).then(() => {
							console.log("Document successfully deleted!");
							isTrash = true;
						}).catch((error) => {
							console.error("Error removing document: ", error);
						});
					}
				}
				
		

				
				//year
				if(dateArr[3] == todayArr[3]){
						//month
						
					if(dateArr[1] ==  todayArr[1]){
						

						console.log(dateArr[2],todayArr[2])
	//date
						if(dateArr[2] == todayArr[2]){
							
							let timeArr = dateArr[4].toString().split(":");
							let todayTimeArr = todayArr[4].toString().split(":");
							console.log(endTimeArr);
							
							let endTimeEnding = "pm";
							let dateTimeEnding = "pm";
							
							
							if(parseInt(endTimeArr[0]) < 12){
								endTimeEnding = "am";
							}

							if(parseInt(todayTimeArr[0]) < 12){
								dateTimeEnding = "am";
							}

							console.log(endTimeEnding,dateTimeEnding);
							

							if(endTimeEnding == dateTimeEnding){
								console.log("runs");
								if(parseInt(endTimeArr[0]) < parseInt(todayTimeArr[0])){
									//min
									console.log(endTimeArr[0]);
									rhit.fbAllEventManager.delete(i).then(() => {
										console.log("Document successfully deleted!");
										isTrash = true;
										
									}).catch((error) => {
										console.error("Error removing document: ", error);
									});
									
								}else if(parseInt(endTimeArr[0]) == parseInt(todayTimeArr[0])){
									if(parseInt(endTimeArr[1]) <= parseInt(todayTimeArr[1])){
										
										rhit.fbAllEventManager.delete(i).then(() => {
											console.log("Document successfully deleted!");
											isTrash = true;
										}).catch((error) => {
											console.error("Error removing document: ", error);
										});
									}
								}
						
							}

							
						}
	
					}
				}
			
				

			}else{
				//update the date
				const eventDate = eventElem.date;
				const date = new Date(eventDate.seconds*1000);
				const dateArr = date.toString().split(" ");
				let today = new Date();
				let todayArr = today.toString().split(" ");
				let endTimeArr = eventElem.endTime.toString().split(":");

				console.log("updating if needed");

				
				let ifSameYear = true;
				let ifSameMonth = true;


				if(todayArr[3] > dateArr[3]){
					let monthDays = [30,28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
				const eventDate = eventElem.date;
				const date = new Date(eventDate.seconds*1000);
				const dateArr = date.toString().split(" ");
				let today = new Date();
				let todayArr = today.toString().split(" ");

				let endTimeArr = eventElem.endTime.toString().split(":");
				let time = date;
				let dateTimeStr = String(time);
				let dateObj = new Date(dateTimeStr);
				let tempDate = dateObj.getDate();
				let tempMonth = dateObj.getMonth();

				let dateArray = dateObj.toString().split(" ");

				let day1 = rhit.convertToDay(dateArray[0]);

				if((tempDate + 7) > monthDays[dateObj.getMonth()]){
					let overFlow= 0;
					let total = tempDate+ 7;

					

					if(tempMonth == 0){
						overFlow = total - monthDays[11];
					}else{
						overFlow = total - monthDays[dateObj.getMonth()];
					}
				
					dateObj.setDate(overFlow);
					dateObj.setMonth(tempMonth);

					let resArr = dateObj.toString().split(" ");
					let day2 = rhit.convertToDay(resArr[0]);

					
					let dateToChange = dateObj.getDate();
					if(day1 > day2){
						while(day1 > day2){
							day2 +=1;
							dateToChange+=1;
						}
					}

					dateObj.setDate(dateToChange);

					rhit.fbAllEventManager.updateDate(i, dateObj);
				}else{
					dateObj.setDate(tempDate+7);
					rhit.fbAllEventManager.updateDate(i, dateObj);
				}
					ifSameYear = false;
				}



				//if month greater
				if(ifSameYear){
					if(todayArr[1] > dateArr[1]){
						let monthDays = [30,28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
				const eventDate = eventElem.date;
				const date = new Date(eventDate.seconds*1000);
				const dateArr = date.toString().split(" ");
				let today = new Date();
				let todayArr = today.toString().split(" ");

				let endTimeArr = eventElem.endTime.toString().split(":");
				let time = date;
				let dateTimeStr = String(time);
				let dateObj = new Date(dateTimeStr);
				let tempDate = dateObj.getDate();
				let tempMonth = dateObj.getMonth();

				let dateArray = dateObj.toString().split(" ");

				let day1 = rhit.convertToDay(dateArray[0]);

				if((tempDate + 7) > monthDays[dateObj.getMonth()]){
					let overFlow= 0;
					let total = tempDate+ 7;

					

					if(tempMonth == 0){
						overFlow = total - monthDays[11];
					}else{
						overFlow = total - monthDays[dateObj.getMonth()];
					}
				
					dateObj.setDate(overFlow);
					dateObj.setMonth(tempMonth);

					let resArr = dateObj.toString().split(" ");
					let day2 = rhit.convertToDay(resArr[0]);

					
					let dateToChange = dateObj.getDate();
					if(day1 > day2){
						while(day1 > day2){
							day2 +=1;
							dateToChange+=1;
						}
					}

					dateObj.setDate(dateToChange);

					rhit.fbAllEventManager.updateDate(i, dateObj);
				}else{
					dateObj.setDate(tempDate+7);
					rhit.fbAllEventManager.updateDate(i, dateObj);
				}
						ifSameMonth = false;
					}
				}


				if(ifSameMonth){
					if(todayArr[2] > dateArr[2]){
						let monthDays = [30,28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
				const eventDate = eventElem.date;
				const date = new Date(eventDate.seconds*1000);
				const dateArr = date.toString().split(" ");
				let today = new Date();
				let todayArr = today.toString().split(" ");

				let endTimeArr = eventElem.endTime.toString().split(":");
				let time = date;
				let dateTimeStr = String(time);
				let dateObj = new Date(dateTimeStr);
				let tempDate = dateObj.getDate();
				let tempMonth = dateObj.getMonth();

				let dateArray = dateObj.toString().split(" ");

				let day1 = rhit.convertToDay(dateArray[0]);

				if((tempDate + 7) > monthDays[dateObj.getMonth()]){
					let overFlow= 0;
					let total = tempDate+ 7;

					

					if(tempMonth == 0){
						overFlow = total - monthDays[11];
					}else{
						overFlow = total - monthDays[dateObj.getMonth()];
					}
				
					dateObj.setDate(overFlow);
					dateObj.setMonth(tempMonth);

					let resArr = dateObj.toString().split(" ");
					let day2 = rhit.convertToDay(resArr[0]);

					
					let dateToChange = dateObj.getDate();
					if(day1 > day2){
						while(day1 > day2){
							day2 +=1;
							dateToChange+=1;
						}
					}

					dateObj.setDate(dateToChange);

					rhit.fbAllEventManager.updateDate(i, dateObj);
				}else{
					dateObj.setDate(tempDate+7);
					rhit.fbAllEventManager.updateDate(i, dateObj);
				}
					}
				}
				
		



		
				//year
				if(date[3]== date[3]){
						//month
						
					if(dateArr[1] ==  todayArr[1]){
						

						
	//date
						if(dateArr[2] == todayArr[2]){
							
							let timeArr = dateArr[4].toString().split(":");
							let todayTimeArr = todayArr[4].toString().split(":");
							let endTimeEnding = "pm";
							let dateTimeEnding = "pm";
							
							
							if(parseInt(endTimeArr[0]) < 12){
								endTimeEnding = "am";
							}

							if(parseInt(todayTimeArr[0]) < 12){
								dateTimeEnding = "am";
							}
						
							console.log(endTimeEnding, dateTimeEnding);
							if(endTimeEnding == dateTimeEnding){
								if(parseInt(endTimeArr[0]) < parseInt(todayTimeArr[0])){
									let monthDays = [30,28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
					const eventDate = eventElem.date;
					const date = new Date(eventDate.seconds*1000);
					const dateArr = date.toString().split(" ");
					let today = new Date();
					let todayArr = today.toString().split(" ");
	
					let endTimeArr = eventElem.endTime.toString().split(":");
					let time = date;
					let dateTimeStr = String(time);
					let dateObj = new Date(dateTimeStr);
					let tempDate = dateObj.getDate();
					let tempMonth = dateObj.getMonth();
	
					let dateArray = dateObj.toString().split(" ");
	
					let day1 = rhit.convertToDay(dateArray[0]);
	
					if((tempDate + 7) > monthDays[dateObj.getMonth()]){
						let overFlow= 0;
						let total = tempDate+ 7;
	
						
	
						if(tempMonth == 0){
							overFlow = total - monthDays[11];
						}else{
							overFlow = total - monthDays[dateObj.getMonth()];
						}
					
						dateObj.setDate(overFlow);
						dateObj.setMonth(tempMonth);
	
						let resArr = dateObj.toString().split(" ");
						let day2 = rhit.convertToDay(resArr[0]);
	
						
						let dateToChange = dateObj.getDate();
						if(day1 > day2){
							while(day1 > day2){
								day2 +=1;
								dateToChange+=1;
							}
						}
	
						dateObj.setDate(dateToChange);
	
						rhit.fbAllEventManager.updateDate(i, dateObj);
					}else{
						dateObj.setDate(tempDate+7);
						rhit.fbAllEventManager.updateDate(i, dateObj);
					}
	
									
								}else if(parseInt(endTimeArr[0]) == parseInt(todayTimeArr[0])){
									if(parseInt(endTimeArr[1]) <= parseInt(todayTimeArr[1])){
										let monthDays = [30,28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
					const eventDate = eventElem.date;
					const date = new Date(eventDate.seconds*1000);
					const dateArr = date.toString().split(" ");
					let today = new Date();
					let todayArr = today.toString().split(" ");
	
					let endTimeArr = eventElem.endTime.toString().split(":");
					let time = date;
					let dateTimeStr = String(time);
					let dateObj = new Date(dateTimeStr);
					let tempDate = dateObj.getDate();
					let tempMonth = dateObj.getMonth();
	
					let dateArray = dateObj.toString().split(" ");
	
					let day1 = rhit.convertToDay(dateArray[0]);
	
					if((tempDate + 7) > monthDays[dateObj.getMonth()]){
						let overFlow= 0;
						let total = tempDate+ 7;
	
						
	
						if(tempMonth == 0){
							overFlow = total - monthDays[11];
						}else{
							overFlow = total - monthDays[dateObj.getMonth()];
						}
					
						dateObj.setDate(overFlow);
						dateObj.setMonth(tempMonth);
	
						let resArr = dateObj.toString().split(" ");
						let day2 = rhit.convertToDay(resArr[0]);
	
						
						let dateToChange = dateObj.getDate();
						if(day1 > day2){
							while(day1 > day2){
								day2 +=1;
								dateToChange+=1;
							}
						}
	
						dateObj.setDate(dateToChange);
	
						rhit.fbAllEventManager.updateDate(i, dateObj);
					}else{
						dateObj.setDate(tempDate+7);
						rhit.fbAllEventManager.updateDate(i, dateObj);
					}
	
										
									}
							}
							}
							
							
	
					}
				}
				}
			}
		

			if(!isTrash){
				const newCard = this._createCard(eventElem);

				newCard.addEventListener("click",(event) => {
					window.location.href = `/eventDetails.html?id=${eventElem.id}`;
					console.log("clicked");
				})
				newList.appendChild(newCard);
			}
			
			//onclick
		};

		const oldList = document.querySelector("#eventContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		//put in the new quoteList Container
		oldList.parentElement.appendChild(newList);

		
	}
}

rhit.event = class{
	constructor(id, title, detail, location, sport, date,imgPath, isReoccuring, endTime){
		this.id = id;
		this.title = title;
		this.detail = detail;
		this.location = location;
		this.sport = sport;
		this.date = date;
		this.imgPath = imgPath;
		this.isReoccuring = isReoccuring;
		this.endTime = endTime;
		
	}
}


rhit.checkForRedirects = function(){

	if(document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn){
		window.location.href = "/selectionPage.html";
	}

	if(!document.querySelector("#loginPage") && !(rhit.fbAuthManager.isSignedIn)){
		
		window.location.href = "/";
	}

};


rhit.eventDetailController = class{
	constructor(){
		
		rhit.fbEventDetailManager.beginListening(this.updateView.bind(this));


		document.querySelector("#add").addEventListener("click",(event) => {
			
			rhit.fbEventDetailManager.joinEvent();
			let eventTitle = rhit.fbEventDetailManager.title;
			let author = rhit.fbEventDetailManager.author;
			let name = rhit.fbUserDataManager.getNameById(author);
			let newMember = rhit.fbUserDataManager.getNameById(rhit.fbAuthManager.uid);
			console.log(name, newMember)
			let whoJoined = `Hi ${name}, \n ${newMember} has just joined your ${eventTitle} event`
		
			let d = rhit.convertDate(rhit.fbEventDetailManager.time)
			let dateTimeStr = String(d);
			let dateObj = new Date(dateTimeStr);

			let message=`you have just joined ${rhit.fbEventDetailManager.title}, which is set for ${dateObj.toString()}`;
			sendMail(rhit.fbAuthManager.uid,message );
			console.log(message);


			document.querySelector("#add").style.visibility = "hidden";
			document.querySelector("#leave").style.visibility = "visible";
			

		 });

		document.querySelector("#submitEditEvent").dataset.dismiss = "";
		document.querySelector("#submitEditEvent").addEventListener("click", (event) => {
		const title = document.querySelector("#inputTitle").value;
		const location = document.querySelector("#inputLocation").value;
		const detail = document.querySelector("#inputDetail").value;
		let time = document.querySelector("#inputDate").value;
		const eTime= document.querySelector("#endTime").value;
		
		let dataValid = true;
		let dateTimeStr = String(time);
		let dateObj = new Date(dateTimeStr);
		let eTimeArr = eTime.split(":");

		let dateArr = dateObj.toString().split(" ");
		let dateTimeArr = dateArr[4].split(":");

		console.log(eTimeArr[0],dateTimeArr[0])
		if(parseInt(eTimeArr[0]) < parseInt(dateTimeArr[0])){

			console.log("error");
			document.querySelector("#errorMsg").style.visibility = "visible";
			dataValid = false;

		}else if(parseInt(eTimeArr[0]) == parseInt(dateTimeArr[0])){
			if(parseInt(eTimeArr[1]) < dateTimeArr[1]){
				console.log("error");
				document.querySelector("#errorMsg").style.visibility = "visible";
				dataValid = false;
			}
		}else{
			dataValid =true;
			document.querySelector("#errorMsg").style.visibility = "hidden";

		}

		if(dataValid){
			document.querySelector("#submitEditEvent").dataset.dismiss = "modal";
		}

		  // const time = document.querySelector("#inputDate").value;

		//    let dateTimeStr = String(time);
		//    let dateObj = new Date(dateTimeStr);
		//    console.log(title);

			let message=`the event ${rhit.fbEventDetailManager.title} has just updated`;
			rhit.fbEventDetailManager.groupMail(message);

			rhit.fbEventDetailManager.updateEdit(
				title, 
				location, 
				detail, 
				dateObj,
				eTime
			);

	   })		

		
	   $("#editDetail").on("shown.bs.modal", (event) => {
		   //post animation
		   document.querySelector("#inputTitle").focus();

	   });


		 rhit.fbEventDetailManager.beginListening(this.updateView.bind(this));


		 //joined event button
		 
		 document.querySelector("#leave").addEventListener("click",(event) => {
			
			rhit.fbEventDetailManager.removeEvent();
			document.querySelector("#leave").style.visibility = "hidden";
			document.querySelector("#add").style.visibility = "visible";
			document.querySelector("#members").style.visibility = "hidden";
		

		 });
		 //issue

		 document.querySelector("#members").addEventListener("click",(event) => {
			window.location.href = `/membersPage.html?eventId=${rhit.fbEventDetailManager.id}`;
		 })


		 document.querySelector("#delete").addEventListener("click",(event) => {
			rhit.fbEventDetailManager.delete().then(() => {
				console.log("Document successfully deleted!");

				let message=`The event ${rhit.fbEventDetailManager.title} has just been deleted!`;
				rhit.fbEventDetailManager.groupMail(message);
				
				

				setTimeout(function() {
					window.location.href = `/selectedSportPage.html?sport=${rhit.fbEventDetailManager.sport}`;
				   }, 2500);
			}).catch((error) => {
				console.error("Error removing document: ", error);
			});
		 })

	}



	updateView(){

		
		$("#editDetail").on('shown.bs.modal', function (event) {
			
			document.querySelector("#inputTitle").value = rhit.fbEventDetailManager.title;
			document.querySelector("#inputDetail").value = rhit.fbEventDetailManager.detail;
			document.querySelector("#inputLocation").value = rhit.fbEventDetailManager.location;
			//current in 

			let today = new Date();
			const date = new Date(rhit.fbEventDetailManager.time.seconds*1000);

			let dateString = `${String(date.getFullYear())}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
			let min = `${String(today.getFullYear())}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T00:00`;
			let max = `${String(today.getFullYear())}-${String(today.getMonth() + 2).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T00:00`;
			document.querySelector("#inputDate").value = dateString;
			document.querySelector("#inputDate").min = min;
			document.querySelector("#inputDate").max = max;
			document.querySelector("#endTime").value = rhit.fbEventDetailManager.endTime;
			

		});
		
	
	






		let membersById = rhit.fbEventDetailManager.membersById
		//current
		let author = rhit.fbEventDetailManager.author;
		
		if(rhit.fbEventDetailManager.author != rhit.fbAuthManager.uid && membersById.includes(rhit.fbAuthManager.uid)){
			document.querySelector("#add").style.visibility = "visible";
		}
			

		if(membersById.includes(rhit.fbAuthManager.uid)){
			document.querySelector("#members").style.visibility = "visible";


			if(author == rhit.fbAuthManager.uid){
				document.querySelector("#add").style.visibility = "hidden";
				document.querySelector("#leave").style.visibility = "hidden";
			}else{
				document.querySelector("#add").style.visibility = "hidden";
				document.querySelector("#leave").style.visibility = "visible";
			}
			
		}else{

			if(author == rhit.fbAuthManager.uid){
				document.querySelector("#add").style.visibility = "hidden";
				document.querySelector("#leave").style.visibility = "hidden";
			}else{
				document.querySelector("#leave").style.visibility = "hidden";
				document.querySelector("#add").style.visibility = "visible";
			}
			
		}

		if(rhit.fbEventDetailManager.author == rhit.fbAuthManager.uid){
			document.querySelector("#members").style.visibility = "visible";
			document.querySelector("#delete").style.visibility = "visible";
			document.querySelector("#edit").style.visibility = "visible";
		
		}


		

		document.querySelector("#title").innerHTML = rhit.fbEventDetailManager.title;
		document.querySelector(".eventImg").src =  rhit.fbEventDetailManager.imgPath;
		document.querySelector(".navbar-brand").innerHTML =  rhit.fbEventDetailManager.title;
		document.querySelector("#heading").innerHTML = rhit.fbEventDetailManager.title;
		document.querySelector("#author").innerHTML = "Organized by: " + rhit.fbUserDataManager.getNameById(author) //fix here
		document.querySelector("#location").innerHTML = rhit.fbEventDetailManager.location;

		
		//console.log(rhit.fbEventDetailManager.detail);
		let detail = rhit.fbEventDetailManager.detail.split("\n");
		document.querySelector("#detail").innerHTML = "";
		for(let i = 0; i < detail.length; i++){
			if(detail[i] == ""){
				document.querySelector("#detail").innerHTML += '<br></br>';
			}else if(detail[i].charAt(0) == "*"){
				document.querySelector("#detail").innerHTML += `<b>${detail[i].replace(/\*/g,"")}</b>`;
			}else{
				document.querySelector("#detail").innerHTML += detail[i];
			}

			
		}

		let date = rhit.convertDate(rhit.fbEventDetailManager.time);

		let dateArr = date.split(" ");
		
		document.querySelector("#date").innerHTML = `${dateArr[0]} ${dateArr[1]} ${dateArr[2]} `;

		let endTime = rhit.fbEventDetailManager.endTime;

		let endTimeArr = endTime.split(":");
		let amOrPm = "am";
		let hour = endTimeArr[0];
		if(parseInt(endTimeArr) > 12){
			amOrPm = "pm";
			hour = hour-12;
		}
		let hour2 = dateArr[3];
		if(hour == 0){
			hour = 12;
			hour2 = 12;
		}
		document.querySelector("#fromTo").innerHTML = `${hour2}${dateArr[4]} to ${hour}:${endTimeArr[1]}${amOrPm}`

		
	}
}

function sendMail(to,message){
	emailjs.send("service_t4d0u8a","template_uwxt9lq",{
		from_name: "Pick-up Sports",
		to_name: to,
		message: message,
		});
}


rhit.FbUserDataManager = class{
	constructor(eventId){
		this._documentSnapshots = [];
		this._collectionRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);

		this.user = null;
	}
 
		beginListening(changeListener){
			this._unsubscribe = this._collectionRef
			.onSnapshot((querySnapshot) => {
				this._documentSnapshots = querySnapshot.docs;
				
				changeListener();
			})
		}

		stopListening() {
			this._unsubscribe();
		}



		getNameById(uid){
			for(let i = 0 ; i < this._documentSnapshots.length; i++){
				if(this._documentSnapshots[i].id == uid){
					return this._documentSnapshots[i].get(rhit.FB_KEY_NAME);
				}
			}
		}
	
	

	stopListening() { this._unsubscribe(); }

}

rhit.FbeventDetailManager = class{
	constructor(eventId){
		this._documentSnapshot = {};
		this._unsubscribe = null;

		console.log(rhit.FB_COLLECTION_EVENTS);
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_EVENTS).doc(eventId);
		this._userDocument = null;
		
	}

	groupMail(message){
		let _membersById=[];
		_membersById =_membersById = this._documentSnapShot.get(rhit.FB_KEY_MEMBER_BY_ID);
		for(let i =0;i<_membersById.length;i++){
			
			sendMail(_membersById[i],message);
		}
	}
	joinEvent(){
		console.log(this._userDocument.get(rhit.FB_KEY_PHOTO_URL))
		this._ref.update({
			membersById : firebase.firestore.FieldValue.arrayUnion(rhit.fbAuthManager.uid)
		})
	

		
	}

	removeEvent(){
		let _membersById=[]
		_membersById = this._documentSnapShot.get(rhit.FB_KEY_MEMBER_BY_ID);
		for(let i =0;i<_membersById.length;i++){
			if(_membersById[i]==rhit.fbAuthManager.uid){
				_membersById.splice(i,1);
			}
		}

	
		this._ref.update({
			
			membersById: _membersById
		})
	}
	updateEdit(title, location, detail, date, endTime){
		this._ref.update({
			title: title,
			location: location,
			detail: detail,
			date:date,
			endTime:endTime,

		})
	}

	//datause


	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			
		if (doc.exists) {

		
        	this._documentSnapShot = doc;

			console.log(this.documentSnapShot);
			
			changeListener();
			
    	} else {
        	// doc.data() will be undefined in this case
        	console.log("No such document!");
			//window.location.href = "/";
    	}

		const collectionRef= this._collectionRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
		const userRef = collectionRef.doc(rhit.fbAuthManager.uid);

		this._unsubscribe = userRef.onSnapshot((doc) => {
			if (doc.exists) {
				this._userDocument= doc;
				changeListener();
				
			} else {
				console.log("No user");
			}
		});
    });
			
	}

	stopListening() {
		this._unsubscribe();
	}

	delete() {
		return this._ref.delete();
	}

	get title(){
		return this._documentSnapShot.get(rhit.FB_KEY_TITLE);
		
	 }
 
	 get time(){
		 return this._documentSnapShot.get(rhit.FB_KEY_DATE);
 
	 }

	 get detail(){
		return this._documentSnapShot.get(rhit.FB_KEY_DETAIL);

	}

	get endTime(){
		return this._documentSnapShot.get(rhit.FB_KEY_END_TIME);
	}
 
	 get location(){
		 return this._documentSnapShot.get(rhit.FB_KEY_LOCATION);
	 }
 
	 get author(){
		return this._documentSnapShot.get(rhit.FB_KEY_AUTHOR);
	}

	get imgPath(){
		return this._documentSnapShot.get(rhit.FB_KEY_IMGPATH);
	}


	get members(){
		return this._documentSnapShot.get(rhit.FB_KEY_MEMBER);
	}

	get id(){
		return this._documentSnapShot.id;
	}

	get sport(){
		return this._documentSnapShot.get(rhit.FB_KEY_SPORT);
	}

	get name(){
		return this._userDocument.get(rhit.FB_KEY_NAME);
	}

	get membersById(){
		return this._documentSnapShot.get(rhit.FB_KEY_MEMBER_BY_ID);
	}




}


rhit.FbMembersDataManager = class{
	constructor(){
		this._documentSnapshots = [];
		this._collectionRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
	}
 
	
		getUserPhotoAtIndex(index){
			const docSnapShot = this._documentSnapshots[index];
			console.log(docSnapShot.data);
			return docSnapShot.get(rhit.FB_KEY_PHOTO_URL);
		}

		beginListening(changeListener){
			this._unsubscribe = this._collectionRef
			.onSnapshot((querySnapshot) => {
				this._documentSnapshots = querySnapshot.docs;
				changeListener();
			querySnapshot.forEach((doc) => {
				console.log(doc.data());
			});

			console.log(this._documentSnapshots); 
		})
		}
}




rhit.membersPageController = class{
	constructor(){
		this._members = [];
		this._photoUrls = [];
		const urlParams = new URLSearchParams(window.location.search);
		const eventId = urlParams.get("eventId");
		document.querySelector(".navbar-brand").href =`/eventDetails.html?id=${eventId}`;
		rhit.fbMembersManager.beginListening(this.updateView.bind(this));
		
	}


	_createProfile(member, photoUrl){
		return htmlToElement(
			`<div class = "col-12 col-md-3 mb-5">
				<img  alt="User photo" class = "user" src = ${photoUrl}>

				<h1>${member}</h1>
			</div>`


		);
	}

	//check point


	updateView(){
		let memberIds = rhit.getMember.memberIds;
		this._members = [];
		this._photoUrls = rhit.fbMembersManager.photoUrls;
		console.log(this._members);
		const newList = htmlToElement('<div id = "membersContainer" class = "row justify-content-center"></div>');
		for(let i = 0; i < rhit.fbMembersManager.length; i++){
			const nu = rhit.fbMembersManager.getDataAtIndex(i);
			
			
			for(let j = 1 ; j < memberIds.length; j++){
				
				if(nu.uid == memberIds[j]){
					
				const memberElem = this._createProfile(nu.name, nu.url);
				newList.appendChild(memberElem);
				}  
			}
			
		}

		

		

		const oldList = document.querySelector("#membersContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		
		oldList.parentElement.appendChild(newList);
		
		
	}


}
//back

//membersManager
rhit.FbMemberManager = class{
	constructor(eventId){
		this._documentSnapshots = [];
		this._collectionRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_EVENTS).doc(eventId);

		this.user = null;
	}
 
		beginListening(changeListener){
			this._unsubscribe = this._collectionRef
			.onSnapshot((querySnapshot) => {
				this._documentSnapshots = querySnapshot.docs;
				
				changeListener();
			})
		}


	getDataAtIndex(index){

	
				const docSnapShot = this._documentSnapshots[index];
				const user = new rhit.user(
					docSnapShot.id,
					docSnapShot.get(rhit.FB_KEY_NAME),
					docSnapShot.get(rhit.FB_KEY_PHOTO_URL),
				);


				return user;

	}
			
	

	get length(){
		return this._documentSnapshots.length;
	}
	
}

rhit.ProfilePageController = class {
	constructor() {
	  console.log("Created Profile page controller");
	  rhit.fbUserManager.beginListening(rhit.fbAuthManager.uid,this.updateView.bind(this));
	  document.querySelector("#submitPhoto").addEventListener("click",(event) => {
			document.querySelector("#inputFile").click();
		})

		document.querySelector("#submitName").addEventListener("click",(event) => {
			const name = document.querySelector("#inputName").value;
			rhit.fbUserManager.updateName(name).then((event) => {
				window.location.href = "/selectionPage.html";
			})
			

		})

		//upload image
		document.querySelector("#inputFile").addEventListener("change",(event) => {
			const file = event.target.files[0];
			const storageRef = firebase.storage().ref().child(rhit.fbAuthManager.uid);

			storageRef.put(file).then((uploadTaskSnapshot) => {
				console.log("file has been uploaded");
				storageRef.getDownloadURL().then((downloadUrl) => {
					rhit.fbUserManager.updatePhotoUrl(downloadUrl);
				});

			});


		})
	}
	updateView() {
		if(rhit.fbUserManager.name){
			document.querySelector("#inputName").value = rhit.fbUserManager.name;
		}

		if(rhit.fbUserManager.photoUrl){
			console.log("runs");
			document.querySelector("#profilePhoto").src = rhit.fbUserManager.photoUrl;
		}
	}
}




rhit.FbUserManager = class {
	constructor() {
	  this._collectionRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
	  this._document = null;
	  this._unsubscribe = null;
	}
	addNewUserMaybe(uid, name, photoUrl) {

		const userref = this._collectionRef.doc(uid);

	return userref.get().then((doc) => {
    	if (doc.exists) {
        	console.log("Document data:", doc.data());
			return false;
    	} else {
        	// doc.data() will be undefined in this case
        	console.log("created this user");

			return userref.set({
				[rhit.FB_KEY_NAME]:name,
				[rhit.FB_KEY_PHOTO_URL]: photoUrl,

			})
			.then(() => {
				console.log("Document successfully written!");
				return true;
			})
			.catch((error) => {
				console.error("Error writing document: ", error);
			});


    	}
		}).catch((error) => {
    		console.log("Error getting document:", error);
		});

	}
	beginListening(uid, changeListener) {

		const userRef = this._collectionRef.doc(uid);

		this._unsubscribe = userRef.onSnapshot((doc) => {
			if (doc.exists) {
				this._document= doc;
				console.log(this._document);
				changeListener();
				
			} else {
				console.log("No user");
			}
		});
				
		}
	
		stopListening() {
			this._unsubscribe();
		}
	
	

	stopListening() { this._unsubscribe(); }
	updatePhotoUrl(photoUrl) {


		const userRef = this._collectionRef.doc(rhit.fbAuthManager.uid);
		userRef.update({
			[rhit.FB_KEY_PHOTO_URL]:photoUrl,
		})
		.then(() => {
			console.log("Document successfully updated!");
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error("Error updating document: ", error);
		});

	}
	updateName(name) {
		const userRef = this._collectionRef.doc(rhit.fbAuthManager.uid);
		return userRef.update({
			[rhit.FB_KEY_NAME]:name,
		})
		.then(() => {
			console.log("Document successfully updated!");

			// const events = firebase.firestore().collection(rhit.FB_COLLECTION_EVENTS);
			// events.onSnapshot((snapShots) => {
			// 	let ds = snapShots.docs;

			// 	for(let i = 0; i < ds.length; i++){
			// 		ds[i].get(rhit.FB_KEY_MEMBER)
			// 	}
			// })
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error("Error updating document: ", error);
		});


		//progress

		

		


	}
	get name() {   return this._document.get(rhit.FB_KEY_NAME); }
	get photoUrl() {   return this._document.get(rhit.FB_KEY_PHOTO_URL); }
}


rhit.getMember = class{
	constructor(eventId){
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_EVENTS).doc(eventId);
		this._userDocument = null;
	}


	beginListening(changeListener){
		this._ref.onSnapshot((doc) => {
			if(doc.exists){
				this._userDocument = doc;
			}
		});
	}

	get memberIds(){
		return this._userDocument.get(rhit.FB_KEY_MEMBER_BY_ID);
	}
}



	

	

	// getUserInfo(uid){
	// 	const collectionRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
	// 	const userRef = collectionRef.doc(uid);
	// 	let newUser = null;
	// 	const docSnapShot = this._documentSnapshots[index];
	// 	userRef.onSnapshot((doc) => {
			
	// 	})
	// 	let newUser = new rhit.user(uid, doc.get(rhit.FB_KEY_NAME), doc.get(rhit.FB_KEY_PHOTO_URL));
	// 		console.log(newUser);
		
		
	// }



rhit.user = class{
	constructor(uid, name, url){
		this.uid = uid;
		this.name = name;
		this.url = url;

	}
}




   
rhit.createUserObjectIfNeeded = function(){
	return new Promise((resolve, reject) => {
		if(!rhit.fbAuthManager.isSignedIn){
			resolve(false);
			return;

		}
		if(!document.querySelector("#loginPage")){
			resolve(false);
			return;
		}


		rhit.fbUserManager.addNewUserMaybe(
			rhit.fbAuthManager.uid,
			rhit.fbAuthManager.name,
			rhit.fbAuthManager.photoUrl
		).then((isUserNew) => {
			resolve(isUserNew);
		});
		
	});
}





rhit.initalizePage = function(){

	if( !document.querySelector("#loginPage")){
	
		document.querySelector("#menuMyEvents").addEventListener("click", (event) => {
			window.location.href = `/selectedSportPage.html?uid=${rhit.fbAuthManager.uid}`
		});

		document.querySelector("#menuEventsJoined").addEventListener("click",(event) => {
			window.location.href = `/selectedSportPage.html?userEventJoined=${rhit.fbAuthManager.uid}`
		});

		
	}
	
	
	if(document.querySelector("#selectionPage")){
		document.querySelector("#eventsJoined").onclick = (event) => {
			window.location.href = `/selectedSportPage.html?userEventJoined=${rhit.fbAuthManager.uid}`
		}

		document.querySelector("#allEvents").onclick = (event) => {
			window.location.href = `/sportsPage.html`;
		}
		
		
	}else if(document.querySelector("#sportsPage")){
		rhit.fbSportsPageManager = new rhit.FbSportsPageManager();
		new rhit.SportsPageController();
	}else if(document.querySelector("#loginPage")){
		
		new rhit.LoginPageController();
	}else if(document.querySelector("#selectedSportPage")){

	
		const urlParams = new URLSearchParams(window.location.search);
		const sport = urlParams.get("sport");

		const urlParams2 = new URLSearchParams(window.location.search);
		const uid = urlParams2.get("uid");

		const urlParams3 = new URLSearchParams(window.location.search);
		const userIdEventJoined = urlParams3.get("userEventJoined");
		

		rhit.fbAllEventManager = new rhit.FbAllEventManager(sport,uid, userIdEventJoined);
		new rhit.allEventPageController();
		
	}else if(document.querySelector("#eventDetailsPage")){
		const urlParams = new URLSearchParams(window.location.search);
		const id = urlParams.get("id");
		rhit.fbEventDetailManager = new rhit.FbeventDetailManager(id);

		rhit.fbUserDataManager = new rhit.FbUserDataManager();

		rhit.fbUserDataManager.beginListening((event) => {
			
		});

		new rhit.eventDetailController();
		

	}else if(document.querySelector("#membersPage")){
		const urlParams = new URLSearchParams(window.location.search);
		const eventId = urlParams.get("eventId");
		rhit.fbMembersManager = new rhit.FbMemberManager(eventId);
		
		rhit.getMember = new rhit.getMember(eventId);


		rhit.getMember.beginListening((event) => {
			
		});

		
		new rhit.membersPageController();

		
		
	}else if(document.querySelector("#profilePage")){
		new rhit.ProfilePageController();
	}
	

	
}



/* Main */
/** function and class syntax examples */
rhit.main = function () {

	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbUserManager = new rhit.FbUserManager();


	rhit.fbAuthManager.beginListening((event) => {

		rhit.createUserObjectIfNeeded().then((isUserNew) => {

			if(isUserNew){
				window.location.href = "/profile.html"
				return;
			}
			rhit.checkForRedirects();
			rhit.initalizePage();
		});
		
	});




	if( !document.querySelector("#loginPage")){
		document.querySelector("#menuHome").addEventListener("click", (event) => {
			window.location.href = "/selectionPage.html";
		});
		document.querySelector("#menuEventsJoined").addEventListener("click", (event) => {
			window.location.href = "/eventsJoinedPage.html";
		});
		document.querySelector("#menuSports").addEventListener("click", (event) => {
			window.location.href = "/sportsPage.html";
		});
		
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});

		if(!document.querySelector("#profilePage")){
			document.querySelector("#menuGoToProfilePage").addEventListener("click",(event) => {
				window.location.href = "/profile.html"
			});
		}

		
	}
	
	


	
};

rhit.main();




