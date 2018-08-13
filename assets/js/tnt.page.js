/* TnT'83 Page Scripts v0.1 */

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

function showSaveLoad() {
	clearScreens();
	$("#mainSave").removeClass("hidden");
}

function showExclusives() {
	clearScreens();
	$("#mainSupport").removeClass("hidden");
}

function showSaveGame() {
	clearSaveLoad();
	$("#saveGame").show();
	$("#txtEmail").focus();
}

function showLoadGame() {
	clearSaveLoad();
	$("#loadGame").show();
	$("#txtLoadCode").focus();
}

function showBonusContent() {
	clearSaveLoad();
	$("#bonusContent").show();
	$("#txtSponsorCode").focus();
}

function sendGameSave() {
	$("#gameSaveSent").toggle();
}

function loadGame() {
	$("#loadingGame").toggle();
}

function getBonusContent() {
	$("#displayBonusContent").toggle();
}

$("#txtEmail").keydown(function(e) {
	if (e.keyCode == 13 || e.keyCode == 9) {
		sendGameSave();
		return false;
	}
});

$("#txtLoadCode").keydown(function(e) {
	if (e.keyCode == 13 || e.keyCode == 9) {
		loadGame();
		return false;
	}
});

$("#txtSponsorCode").keydown(function(e) {
	if (e.keyCode == 13 || e.keyCode == 9) {
		getBonusContent();
		return false;
	}
});

function clearScreens() {
	$("#mainSplash").addClass("hidden");
	$("#mainMenuButton").removeClass("hidden");
	$("#mainGame").addClass("hidden");
	$("#mainMorgue").addClass("hidden");
	$("#mainTutorial").addClass("hidden");
	$("#mainSupport").addClass("hidden");
	$("#mainSave").addClass("hidden");
}

function clearSaveLoad() {			
	$("#saveGame").hide();
	$("#loadGame").hide();
	$("#bonusContent").hide();
}

function goToByScroll(id){
    $('html,body').animate({scrollTop: $("#"+id).offset().top},'slow');
}