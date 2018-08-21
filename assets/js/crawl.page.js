/* TnT'83 Page Scripts v0.2 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
var splash = getRoll(1,5);
$("#splash" + splash).removeClass("hidden");
var checkExistingGame = localStorage.get('activeGame');
if (checkExistingGame != null) {
	$("#startGameLink").addClass("hidden");
	$("#resumeGameLink").removeClass("hidden");
	$("#resetGameLink").removeClass("hidden");
	loadCurrentGame(null);
}
else
	loadDefaults();

function showMenu() {
	clearScreens();
	$("#mainMenuButton").addClass("hidden");
	$("#mainSplash").removeClass("hidden");
}

function startGame() {
	clearScreens();
	startGameEngine();
	$("#startGameLink").addClass("hidden");
	$("#resumeGameLink").removeClass("hidden");
	$("#mainGame").removeClass("hidden");
	$("#resetGameLink").removeClass("hidden");
}

function resumeGame() {
	clearScreens();
	$("#mainGame").removeClass("hidden");
}

function resetGame() {
	if (confirm("This will wipe out your current game and start from the beginning. Are you sure?")) {
		clearScreens();
		resetGameEngine();
		$("#startGameLink").removeClass("hidden");
		$("#resumeGameLink").addClass("hidden");
		$("#resetGameLink").addClass("hidden");
		$("#mainSplash").removeClass("hidden");
		$("#mainMenuButton").addClass("hidden");
	}
}

function showMorgue() {
	clearScreens();
	$("#mainMorgue").removeClass("hidden");
	buildMorgue();
}

function showTutorial() {
	clearScreens();
	$("#mainTutorial").removeClass("hidden");
}

function clearScreens() {
	$("#mainSplash").addClass("hidden");
	$("#mainMenuButton").removeClass("hidden");
	$("#mainGame").addClass("hidden");
	$("#mainMorgue").addClass("hidden");
	$("#mainTutorial").addClass("hidden");
}

function goToByScroll(id){
    $('html,body').animate({scrollTop: $("#"+id).offset().top},'slow');
}