/* TnT '83 Crawl Game Engine v0.3 */
/* simpleWebStorage by Zevero */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
var realmData;
var playerData;
var experienceData;
var treasureData;
var adversaryData;
var trapData;
var merchantData;
var morgueData;
var terminalTimeout;

function loadDefaults() {
	$.getJSON( "assets/data/realmDefault.json", function( data ) {
		localStorage.set('realmData', data);
	});
	$.getJSON( "assets/data/playerDefault.json", function( data ) {
		localStorage.set('playerData', data);
	});	
	$.getJSON( "assets/data/experienceDefault.json", function( data ) {
		localStorage.set('experienceData', data);
	});	
	$.getJSON( "assets/data/treasureDefault.json", function( data ) {
		localStorage.set('treasureData', data);
	});	
	$.getJSON( "assets/data/adversaryDefault.json", function( data ) {
		localStorage.set('adversaryData', data);
	});
	$.getJSON( "assets/data/trapDefault.json", function( data ) {
		localStorage.set('trapData', data);
	});
	$.getJSON( "assets/data/merchantDefault.json", function( data ) {
		localStorage.set('merchantData', data);
	});
	$.getJSON( "assets/data/morgueDefault.json", function( data ) {
		localStorage.set('morgueData', data);
	});
};

function startGameEngine() {
	localStorage.set('activeGame', 1);
	loadCurrentGame(null);
};

function resumeGameEngine() {
	loadCurrentGame(null);
};

function resetGameEngine() {
	localStorage.clear();
	loadDefaults();
};

function loadCurrentGame(returnMessage) {
	realmData = localStorage.get('realmData');
	playerData = localStorage.get('playerData');
	experienceData = localStorage.get('experienceData');
	treasureData = localStorage.get('treasureData');
	adversaryData = localStorage.get('adversaryData');
	trapData = localStorage.get('trapData');
	merchantData = localStorage.get('merchantData');
	morgueData = localStorage.get('morgueData');	
	
	buildHeader();
	buildRoom();
	returnMessage = checkGameOver(returnMessage);
	
	if (returnMessage != null && returnMessage != "checkTrapAdversary"){
		$("#terminalText").empty().html("");
		displayTerminal(returnMessage + "<p>");
	}
	
	if (returnMessage == "checkTrapAdversary")
		checkTrapAdversary();
};

function buildHeader() {
	document.getElementById('playerStats').textContent = "POT:" + playerData.playerPotions + "   HP:" + playerData.playerHitPoints + "/" + playerData.playerMaxHitPoints;
	document.getElementById('realmStats').textContent = "LVL:" + (playerData.realmLevelIndex + 1) + "   MOV:" + playerData.playerMoves;
}

function displayTerminal(terminalText) {	
		$("#terminalText").empty().html("");
		$("#terminalText").html(terminalText);
}

function buildRoom() {
	var l, x, y, z, svgRoomData, svgControlData;
	var level = playerData.realmLevelIndex;
	var moves = playerData.playerMoves;
	var p = playerData.playerPerception;
	var room = playerData.realmRoomIndex;
	var roll = realmData.Levels[level].levelRollMax;
	var tr = trapData[0].trapName;
	var trid = realmData.Levels[level].Rooms[room].roomTreasureID;
	var troll = realmData.Levels[level].levelTreasureRoll;
	var rHeader = realmData.Levels[level].Rooms[room].roomName;
	var rSubHeader = "";
	var rDescriptionOnce = realmData.Levels[level].Rooms[room].roomDescriptionOnce;
	var rDescription = realmData.Levels[level].Rooms[room].roomDescription;
	if (rDescriptionOnce != null) {
		rDescription = rDescriptionOnce;
		realmData.Levels[level].Rooms[room].roomDescriptionOnce = null;
		localStorage.set('realmData', realmData);
	}
	
	svgRoomData = '<line x1="0" y1="0" x2="480" y2="0" id="wallNorth" /><line x1="480" y1="480" x2="480" y2="0" id="wallEast" /><line x1="0" y1="480" x2="480" y2="480" id="wallSouth" /><line x1="0" y1="0" x2="0" y2="480" id="wallWest" /><circle cx="240" cy="240" r="20" fill="#41FF00" id="playerBody" /><text x="240" y="60" fill="#41FF00" text-anchor="middle" id="roomHeaderText" class=""></text><text x="240" y="80" fill="#41FF00" text-anchor="middle" id="roomSubHeaderText" class=""></text><switch><foreignObject x="50" y="302" width="388" height="165"><p id="terminalText"></p></foreignObject><text x="240" y="330" fill="#41FF00" text-anchor="middle">Your SVG viewer cannot display html.</text></switch>';
	
	svgRoomData += '<polyline points="240,90 260,120, 220,120 240,90" id="adversarySmall" class="hidden" /><polyline points="240,90 280,140, 200,140 240,90" id="adversaryMedium" class="hidden" /><polyline points="240,90 300,160, 180,160 240,90" id="adversaryBig" class="hidden" />';
	
	svgRoomData += '<rect x="215" y="115" width="50" height="50" fill="#41FF00" id="merchant" class="hidden" />';
	
	if (playerData.currentWeaponIndex > 1)
		svgRoomData += '<polyline points="280,220 280,260 280,247 267,247 293,247" id="playerWeapon" />';
	else
		svgRoomData += '<polyline class="hidden" points="280,220 280,260 280,247 267,247 293,247" id="playerWeapon" />';
	
	if (playerData.currentMagicIndex != null)
		svgRoomData += '<line x1="200" y1="220" x2="200" y2="260" id="playerMagic" />';
	else
		svgRoomData += '<line class="hidden" x1="200" y1="220" x2="200" y2="260" id="playerMagic" />';
	
	svgControlData += '<g><rect x="1" y="15" width="104" height="40" fill="#282828" class="buttonDisabled" /><text x="52" y="40" fill="#207f00" text-anchor="middle">North</text></g><g><rect x="125" y="15" width="104" height="40" class="buttonDisabled" /><text x="177" y="40" fill="#207f00" text-anchor="middle">East</text></g><g><rect x="125" y="70" width="104" height="40" class="buttonDisabled" /><text x="177" y="95" fill="#207f00" text-anchor="middle">South</text></g><g><rect x="1" y="70" width="104" height="40" class="buttonDisabled" /><text x="52" y="95" fill="#207f00" text-anchor="middle">West</text></g><g><rect x="250" y="15" width="104" height="40" class="buttonDisabled" /><text x="302" y="40" fill="#207f00" text-anchor="middle">Up</text></g><g><rect x="250" y="70" width="104" height="40" class="buttonDisabled" /><text x="302" y="95" fill="#207f00" text-anchor="middle">Down</text></g><g class="buttonGroup" id="" onclick="searchRoom()"><rect x="376" y="15" width="103" height="40" class="button" /><text x="427" y="40" fill="#41FF00" text-anchor="middle">Search</text></g><g class="buttonGroup" id="" onclick="checkStats(null)"><rect x="376" y="70" width="103" height="40" id="" class="button" /><text x="427" y="95" fill="#41FF00" text-anchor="middle">Stuff</text></g>';
	
    for (j in realmData.Levels[level].Rooms[room].Exits) {
			l = realmData.Levels[level].Rooms[room].Exits[j].newLevelID;
			x = realmData.Levels[level].Rooms[room].Exits[j].exitRoomID;
			y = realmData.Levels[level].Rooms[room].Exits[j].exitDirection;
			z = realmData.Levels[level].Rooms[room].Exits[j].exitSecret;
			if (z != 1) {
				if (y == "North") {
					svgControlData += '<g class="buttonGroup" id="" onclick="playerMove(' + x + ',' + j + ',' + l + ')"><rect x="1" y="15" width="104" height="40" class="button" /><text x="52" y="40" fill="#41FF00" text-anchor="middle">North</text></g>';
					svgRoomData += '<line x1="160" y1="0" x2="320" y2="0" id="doorNorth" />';
					
					if (realmData.Levels[level].Rooms[room].Exits[j].exitLocked == 1 || realmData.Levels[level].Rooms[room].Exits[j].exitBlocked == 1 || realmData.Levels[level].Rooms[room].Exits[j].exitTrapped == 1) {
						svgRoomData += '<polyline points="225,15 240,30 255,15 240,1 225,15" id="obstacleNorth" />';
					}
					else
						svgRoomData += '<polyline points="225,15 240,30 255,15 240,1 225,15" id="obstacleNorth" class="hidden" />';
				}
				if (y == "East") {
					svgControlData += '<g class="buttonGroup" id="" onclick="playerMove(' + x + ',' + j + ',' + l + ')"><rect x="125" y="15" width="104" height="40" class="button" /><text x="177" y="40" fill="#41FF00" text-anchor="middle">East</text></g>';
					svgRoomData += '<line x1="480" y1="160" x2="480" y2="320" id="doorEast" />';
					
					if (realmData.Levels[level].Rooms[room].Exits[j].exitLocked == 1 || realmData.Levels[level].Rooms[room].Exits[j].exitBlocked == 1 || realmData.Levels[level].Rooms[room].Exits[j].exitTrapped == 1) {
						svgRoomData += '<polyline points="465,225 480,240 465,255 450,240 465,225" id="obstacleEast" />';
					}
					else
						svgRoomData += '<polyline points="465,225 480,240 465,255 450,240 465,225" id="obstacleEast" class="hidden" />';
				}
				if (y == "South") {
					svgControlData += '<g class="buttonGroup" id="" onclick="playerMove(' + x + ',' + j + ',' + l + ')"><rect x="125" y="70" width="104" height="40" id="" class="button" /><text x="177" y="95" fill="#41FF00" text-anchor="middle">South</text></g>';
					svgRoomData += '<line x1="160" y1="480" x2="320" y2="480" id="doorSouth" />';
					
					if (realmData.Levels[level].Rooms[room].Exits[j].exitLocked == 1 || realmData.Levels[level].Rooms[room].Exits[j].exitBlocked == 1 || realmData.Levels[level].Rooms[room].Exits[j].exitTrapped == 1) {
						svgRoomData += '<polyline points="225,465 240,480 255,465 240,450 225,465" id="obstacleSouth" />';
					}
					else
						svgRoomData += '<polyline points="225,465 240,480 255,465 240,450 225,465" id="obstacleSouth" class="hidden" />';
				}
				if (y == "West") {
					svgControlData += '<g class="buttonGroup" id="" onclick="playerMove(' + x + ',' + j + ',' + l + ')"><rect x="1" y="70" width="104" height="40" id="" class="button" /><text x="52" y="95" fill="#41FF00" text-anchor="middle">West</text></g>';
					svgRoomData += '<line x1="0" y1="160" x2="0" y2="320" id="doorWest" />';
					
					if (realmData.Levels[level].Rooms[room].Exits[j].exitLocked == 1 || realmData.Levels[level].Rooms[room].Exits[j].exitBlocked == 1 || realmData.Levels[level].Rooms[room].Exits[j].exitTrapped == 1) {
						svgRoomData += '<polyline points="15,225 30,240 15,255 1,240 15,225" id="obstacleWest" />';
					}
					else
						svgRoomData += '<polyline points="15,225 30,240 15,255 1,240 15,225" id="obstacleWest" class="hidden" />';
				}
				if (y == "Up") {
					svgControlData += '<g class="buttonGroup" id="" onclick="playerMove(' + x + ',' + j + ',' + l + ')"><rect x="250" y="15" width="104" height="40" class="button" /><text x="302" y="40" fill="#41FF00" text-anchor="middle">Up</text></g>';
					svgRoomData += '<polyline points="85,42 69,42 69,57 57,57 57,72 40,72 " id="stairsUp" />';

					if (realmData.Levels[level].Rooms[room].Exits[j].exitLocked == 1 || realmData.Levels[level].Rooms[room].Exits[j].exitBlocked == 1 || realmData.Levels[level].Rooms[room].Exits[j].exitTrapped == 1) {
						svgRoomData += '<polyline points="63,52 68,57 63,62 58,57 63,52" id="obstacleUp" />';
					}
					else
						svgRoomData += '<polyline points="63,52 68,57 63,62 58,57 63,52" id="obstacleUp" class="hidden" />';
				}
				if (y == "Down") {
					svgControlData += '<g class="buttonGroup" id="" onclick="playerMove(' + x + ',' + j + ',' + l + ')"><rect x="250" y="70" width="104" height="40" id="" class="button" /><text x="302" y="95" fill="#41FF00" text-anchor="middle">Down</text></g>';
					svgRoomData += '<polyline points="395,42 411,42 411,57 423,57 423,72 440,72 " id="stairsDown" />';
					
					if (realmData.Levels[level].Rooms[room].Exits[j].exitLocked == 1 || realmData.Levels[level].Rooms[room].Exits[j].exitBlocked == 1 || realmData.Levels[level].Rooms[room].Exits[j].exitTrapped == 1) {
						svgRoomData += '<polyline points="417,52 422,57 417,62 412,57 417,52" id="obstacleDown" />';
					}
					else
						svgRoomData += '<polyline points="417,52 422,57 417,62 412,57 417,52" id="obstacleDown" class="hidden" />';
				}
			}			
		}
		
	$("#svgRoom").empty().html("");	
	$("#svgControls").empty().html("");	
	
	$("#svgRoom").html(svgRoomData);
	$("#svgControls").html(svgControlData);
	
	document.getElementById('roomHeaderText').textContent = rHeader;
	rSubHeader = checkExperienceLevel();
	document.getElementById('roomSubHeaderText').textContent = rSubHeader;
	if (rDescription != null && rDescription != "")
		displayTerminal(rDescription);
}

function checkGameOver(returnMessage) {	
	var level = playerData.realmLevelIndex;
	var room = playerData.realmRoomIndex;
	var currentArmorIndex = playerData.currentArmorIndex;
	var currentWeaponIndex = playerData.currentWeaponIndex;
	var currentMagicIndex = playerData.currentMagicIndex;
	var levelToWin = realmData.realmLevelToWin;
	var roomToWin = realmData.realmRoomToWin;
	var treasureToWin = realmData.realmTreasureToWin;
	var gameOver = null;
	
	if (levelToWin != null && roomToWin != null && treasureToWin != null) {
		if (levelToWin == level && roomToWin == room) {
			if (treasureToWin == currentArmorIndex || treasureToWin == currentWeaponIndex || treasureToWin == currentMagicIndex) {
				gameOver = 1;
			}
		}
	}
	else if (levelToWin != null && roomToWin != null) {
		if (levelToWin == level && roomToWin == room) {
			gameOver = 1;
		}
	}
	else if (levelToWin != null && treasureToWin != null) {
		if (levelToWin == level) {
			if (treasureToWin == currentArmorIndex || treasureToWin == currentWeaponIndex || treasureToWin == currentMagicIndex) {
				gameOver = 1;
			}
		}
	}
	else if (levelToWin != null) {
		if (levelToWin == level) {
			gameOver = 1;
		}
	}
	else if (treasureToWin != null) {
		if (treasureToWin == currentArmorIndex || treasureToWin == currentWeaponIndex || treasureToWin == currentMagicIndex) {
			gameOver = 1;
		}
	}
	if (gameOver != null) {
		var totalSecrets = realmData.realmTotalSecrets;
		var foundSecrets = playerData.playerFoundSecrets;
		var totalRevived = playerData.playerRevived;
		var totalRan = playerData.playerRan;
		returnMessage = realmData.realmWonMessage + "<p>Secrets Found: " + foundSecrets + "/" + totalSecrets + " Died: " + totalRevived + " Ran: " + totalRan;
		if ((foundSecrets < totalSecrets) || totalRevived > 0 || totalRan > 0)
			returnMessage += "<p>You can do better next time!";
		else
			returnMessage += "<p>Great job!";
		$("#svgControls").empty().html("");
		var svgControlData = '<g class="buttonGroup" id="" onclick="showMorgue()"><rect x="1" y="15" width="104" height="40" class="button" /><text x="52" y="40" fill="#41FF00" text-anchor="middle">Morgue</text></g><g class="buttonGroup" id="" onclick="resetGame()"><rect x="125" y="15" width="104" height="40" class="button" /><text x="177" y="40" fill="#41FF00" text-anchor="middle">Reset</text></g>';
		
		$("#svgControls").html(svgControlData);
	}
	return returnMessage;
}

function playerMove(direction, exitID, levelID) {
	var isObstacle = null;
	if (direction != null && exitID != null)
		isObstacle = checkExitObstacles(direction, exitID, levelID);
	if (isObstacle != "obstacle") {
		updatePlayerMoves(direction, levelID);
		loadCurrentGame("checkTrapAdversary");
	}
}

function updatePlayerMoves(direction, levelID) {
	var moves = playerData.playerMoves;
	moves = moves + 1;
	if (direction == null) {
		playerData.playerMoves = moves;
		localStorage.assign('playerData', {playerMoves: moves});
	}
	else if (levelID !=null)
		localStorage.assign('playerData', {playerMoves: moves, realmRoomIndex: direction, realmLevelIndex: levelID});
	else
		localStorage.assign('playerData', {playerMoves: moves, realmRoomIndex: direction});
}

function checkExperienceLevel() {
	var currentLevel = playerData.playerLevel;
	var currentXP = playerData.playerExperience;
	var currentMaxHP = playerData.playerMaxHitPoints;
	var currentAP = playerData.playerAbilityPoints;	
	var returnMessage = "";
	
	if (currentAP == null)
		currentAP = 0;
	if (currentLevel < (experienceData.length - 1)) {
		var nextLevelXP = experienceData[currentLevel + 1].experienceRequired;
		var nextLevelAP = experienceData[currentLevel + 1].experienceAP;
		var nextLevelHP = experienceData[currentLevel + 1].experienceHP;
		if (currentXP >= nextLevelXP) {
			playerData.playerLevel += 1;
			playerData.playerMaxHitPoints = currentMaxHP + nextLevelHP;
			playerData.playerAbilityPoints = nextLevelAP + currentAP;
			returnMessage = "Level Up! Character Level " + currentLevel + 1;
			localStorage.set('playerData', playerData);
			buildHeader();
		}
	}
	
	return returnMessage;
}

function checkTrapAdversary() {
	var x,y,z;
	var level = playerData.realmLevelIndex;
	var room = playerData.realmRoomIndex;
	var luck = playerData.playerLuck;
	var roll;
	var trapRoll = realmData.Levels[level].levelTrapRoll;
	var adversaryRoll = realmData.Levels[level].levelAdversaryRoll;
	var maxRoll = realmData.Levels[level].levelRollMax;
	var probability;
	var trapID = realmData.Levels[level].Rooms[room].roomTrapID;	
	var trapRandom = realmData.Levels[level].Rooms[room].roomTrapRandom;
	var trapType;
	var foundTrap = null;
	var trapIndex = [];
	var trapLevelMin;
	var trapLevelMax;
	var trapMaxSpawn;
	var adversaryID = realmData.Levels[level].Rooms[room].roomAdversaryID;
	var adversaryRandom = realmData.Levels[level].Rooms[room].roomAdversaryRandom;
	var adversaryType;
	var foundAdversary = null;
	var adversaryIndex = [];
	var trapLevelMin;
	var trapLevelMax;
	var trapMaxSpawn;
	var spawnType = 0;
	var isSurprise = 0;
	var returnMessage = "phew";	
	
	if (trapRandom != null) {
		for (j in trapData) {
			y = trapData[j].trapAllowRandom;
			if (y == 1 && trapData.trapType != "D"){
				trapMaxSpawn = trapData[j].trapMaxSpawn;
				if (trapMaxSpawn != 0) {
					trapLevelMin = trapData[j].trapMinLevel;
					trapLevelMax = trapData[j].trapMaxLevel;
					if (trapLevelMin == null)
						trapLevelMin = 0;
					if (trapLevelMax == null)
						trapLevelMax = 999;
					if (trapLevelMin <= (level + 1) && trapLevelMax >= (level + 1)) {								
						trapIndex.push(j);
					}
				}
			}
		}
	}
	
	if (adversaryRandom != null) {
		for (j in adversaryData) {
			y = adversaryData[j].adversaryAllowRandom;
			if (y == 1){
				adversaryMaxSpawn = adversaryData[j].adversaryMaxSpawn;
				if (adversaryMaxSpawn != 0) {
					adversaryLevelMin = adversaryData[j].adversaryMinLevel;
					adversaryLevelMax = adversaryData[j].adversaryMaxLevel;
					if (adversaryLevelMin == null)
						adversaryLevelMin = 0;
					if (adversaryLevelMax == null)
						adversaryLevelMax = 999;
					if (adversaryLevelMin <= (level + 1) && adversaryLevelMax >= (level + 1)) {								
						adversaryIndex.push(j);
					}
				}
			}
		}
	}
	
	if (trapID != null){
		trapMaxSpawn = trapData[trapID].trapMaxSpawn;
		if (trapMaxSpawn == 0)
			trapID = null;
	}
	
	if (adversaryID != null){
		adversaryMaxSpawn = adversaryData[adversaryID].adversaryMaxSpawn;
		if (adversaryMaxSpawn == 0)
			adversaryID = null;
	}
	
	if (adversaryID != null) 
		spawnType = 2;
	else if (trapID != null)
		spawnType = 1;	
	else if (trapIndex != ""  && adversaryIndex != "")
		spawnType = getRoll(1, 3);
	else if (trapIndex != "")
		spawnType = 1;
	else if (adversaryIndex != "") 
		spawnType = 2;
	
	roll = getRoll(1, maxRoll + 1);	
	if (spawnType == 1) {
		probability = Math.abs(luck - trapRoll)
		if (probability == 0)
			probability = 1;
		if (trapID == null) {
			if (roll <= (probability)) {	
				//trapType = 0;
				//if (trapIndex != "" && trapID !=null) {
				//	trapType = getRoll(0, 2);
				//}
				//else if (trapID !=null)
				//	trapType = 1;
				
				//if (trapType == 0) {
					var numTraps = trapIndex.length;
					var whichTrap = 0;
					if (numTraps > 1) {
						whichTrap = getRoll(0, numTraps);
					}
					foundTrap = trapIndex[whichTrap];
					if (trapRandom == 1)
						realmData.Levels[level].Rooms[room].roomTrapRandom = null;
					else
						realmData.Levels[level].Rooms[room].roomTrapRandom = trapRandom - 1;
				//}
			}
		}
		else {
			foundTrap = trapID;
			realmData.Levels[level].Rooms[room].roomTrapID = null;
		}
		
		if (foundTrap != null) {			
			localStorage.set('realmData', realmData);
			buildTrap(foundTrap);
		}			
	}
	else if (spawnType == 2) {
		probability = Math.abs(luck - adversaryRoll);
		if (probability == 0)
			probability = 1;
		if (adversaryID == null) {
			if (roll <= (probability)) {	
				//adversaryType = 0;
				//if (adversaryIndex != "" && adversaryID !=null) {
				//	adversaryType = getRoll(0, 2);
				//}
				//else if (adversaryID !=null)
				//	adversaryType = 1;
				
				//if (adversaryType == 0) {
					var numAdversary = adversaryIndex.length;
					var whichAdversary = 0;
					if (numAdversary > 1) {
						whichAdversary = getRoll(0, numAdversary);
					}
					foundAdversary = adversaryIndex[whichAdversary];
					if (adversaryRandom == 1)
						realmData.Levels[level].Rooms[room].roomAdversaryRandom = null;
					else 
						realmData.Levels[level].Rooms[room].roomAdversaryRandom = adversaryRandom - 1;
					localStorage.set('realmData', realmData);
				//}				
			}
		}
		else
			foundAdversary = adversaryID;
		
		if (foundAdversary != null) {
			var adversarySurprise = adversaryData[foundAdversary].adversarySurprise;
			if (adversarySurprise != null) {
				probability = Math.abs(adversarySurprise - luck);
				roll = getRoll(1, maxRoll + 1);	
				if (probability <= roll)
					isSurprise = 1;
			}
			buildAdversary(foundAdversary, isSurprise, null, null);
		}
	}
}

function buildTrap(trapID) {
	var trapName = trapData[trapID].trapName;
	var trapType = trapData[trapID].trapType;
	var trapDamage = trapData[trapID].trapDamage;
	var trapExperience = trapData[trapID].trapExperience;
	var level = playerData.realmLevelIndex;
	var playerHitPoints = playerData.playerHitPoints;
	var playerExperience = playerData.playerExperience;
	var playerDexterity = playerData.playerDexterity;
	var roll;
	var missRoll;
	var maxRoll = realmData.Levels[level].levelRollMax;
	var trapAvoidDisarm;
	var	returnMessage = "Trap! " + trapName + ".";
	
	roll = getRoll(1, maxRoll + 1);
	if (roll > playerDexterity) {
		playerHitPoints -= trapDamage;
		returnMessage += "<p>It inflicts " + trapDamage + " damage.<p>";
		if (playerHitPoints <= 0) {
			playerDied(returnMessage);
			return;
		}
		playerData.playerHitPoints = playerHitPoints;
	}
	else {
		playerExperience += trapExperience;
		missRoll = getRoll(0,2);
		if (missRoll = 0)
			trapAvoidDisarm = "avoid";
		else
			trapAvoidDisarm = "disarm";
		playerData.playerExperience = playerExperience;
		returnMessage += "<p>You were able to " + trapAvoidDisarm + " the trap.<p>You gained " + trapExperience + " XP.";
	}

	// var foundInMorgue = 0;
	// for (j in morgueData) {
		// x = morgueData[j].morgueID;
		// y = morgueData[j].morgueType;
		// if (y == "R"){
			// if (x == trapID) {
				// morgueData[j].morgueCount += 1;
				// foundInMorgue = 1;
			// }
		// }
	// }
	// if (foundInMorgue == 0) {
		// var morgueDate = new Date();
		// morgueData.push({"morgueID": trapID, "morgueType": "R", "morgueDate": morgueDate.toString(), "morgueCount": 1});
	// }
	addToMorgue(trapID, "R");
			
	localStorage.set('playerData', playerData);
	localStorage.set('morgueData', morgueData);
	loadCurrentGame(returnMessage);
}

function buildAdversary(adversaryID, isSurprise, returnMessage, adversaryTurn) {
	var adversaryName = adversaryData[adversaryID].adversaryName;
	var adversaryType = adversaryData[adversaryID].adversaryType;
	var adversaryDamage = adversaryData[adversaryID].adversaryDamage;
	var adversaryProtection = adversaryData[adversaryID].adversaryProtection;
	var adversaryExperience = adversaryData[adversaryID].adversaryExperience;
	var adversaryMaxHitPoints = adversaryData[adversaryID].adversaryMaxHitPoints;
	var adversaryHitPoints = adversaryData[adversaryID].adversaryHitPoints;
	var currentMagicIndex = playerData.currentMagicIndex;
	var currentMagicCount = playerData.currentMagicCount;
	var playerMagicRespawn = playerData.playerMagicRespawn;
	var level = playerData.realmLevelIndex;
	var playerHitPoints = playerData.playerHitPoints;
	var playerExperience = playerData.playerExperience;
	var playerDexterity = playerData.playerDexterity;
	var playerLuck = playerData.playerLuck;
	var roll;
	var maxRoll = realmData.Levels[level].levelRollMax;
	var terminalText = "";
	var svgControlData = '<g class="buttonGroup" id="btnMeleeWeapon" onclick="attackWeapon(' + adversaryID + ')"><rect x="1" y="15" width="104" height="40" fill="#282828" class="button" /><text x="52" y="40" fill="#41FF00" text-anchor="middle">Weapon</text></g><g class="buttonGroup" id="" onclick="attackMagic(' + adversaryID + ')"><rect x="125" y="15" width="104" height="40" class="button" /><text x="177" y="40" fill="#41FF00" text-anchor="middle">Magic</text></g><g class="buttonGroup hidden"><rect x="250" y="15" width="104" height="40" class="button" /><text x="302" y="40" fill="#41FF00" text-anchor="middle"></text></g><g class="buttonGroup" id="" onclick="runAway(' + adversaryID + ')"><rect x="376" y="15" width="103" height="40" class="button" /><text x="427" y="40" fill="#41FF00" text-anchor="middle">Run!</text></g><g class="buttonGroup" id="" onclick="attackCombo(' + adversaryID + ')"><rect x="1" y="70" width="104" height="40" id="" class="button" /><text x="52" y="95" fill="#41FF00" text-anchor="middle">Combo</text></g><g class="buttonGroup" id="" onclick="attackHeal(' + adversaryID + ')"><rect x="125" y="70" width="104" height="40" id="" class="button" /><text x="177" y="95" fill="#41FF00" text-anchor="middle">Heal</text></g><g class="buttonGroup hidden" id="" onclick=""><rect x="250" y="70" width="104" height="40" id="" class="button" /><text x="302" y="95" fill="#41FF00" text-anchor="middle"></text></g><g class="buttonGroup hidden" id="" onclick=""><rect x="376" y="70" width="103" height="40" id="" class="button" /><text x="427" y="95" fill="#41FF00" text-anchor="middle"></text></g>';
	
	if ((playerData.playerMoves < (playerMagicRespawn + currentMagicCount)) || currentMagicIndex == null) {
		svgControlData += '<g><rect x="125" y="15" width="104" height="40" class="buttonDisabled" /><text x="177" y="40" fill="#207f00" text-anchor="middle">Magic</text></g><g><rect x="1" y="70" width="104" height="40" id="" class="buttonDisabled" /><text x="52" y="95" fill="#207f00" text-anchor="middle">Combo</text></g>';
	}
	
	if (playerData.playerHitPoints >= playerData.playerMaxHitPoints || playerData.playerPotions < 1) {
		svgControlData += '<g><rect x="125" y="70" width="104" height="40" id="" class="buttonDisabled" /><text x="177" y="95" fill="#207f00" text-anchor="middle">Heal</text></g>';
	}
	
	if (adversaryType == "B")
		$("#adversaryBig").removeClass("hidden");
	else if (adversaryType == "M")
		$("#adversaryMedium").removeClass("hidden");
	else
		$("#adversarySmall").removeClass("hidden");
	
	if (isSurprise == 1) {
		terminalText = "The " + adversaryName + " surprises you!";
		roll = getRoll(1, maxRoll + 1);
		if (roll > playerDexterity) {
			playerHitPoints -= adversaryDamage;
			terminalText += "<p>It attacks and hits for " + adversaryDamage + " damage.<p>";
			if (playerHitPoints <= 0) {
				playerDied(terminalText);
				return;
			}
			playerData.playerHitPoints = playerHitPoints;
			localStorage.assign('playerData', {playerHitPoints: playerHitPoints});
		}
		else {
			terminalText += "<p>It attacks and misses.";
		}
	}
	else if (isSurprise == 0) 
		terminalText = "You surprise the " + adversaryName + "!<p>You get first attack.";
	else
		terminalText = returnMessage;
	
	$("#svgControls").empty().html("");
	
	displayTerminal(terminalText);
	if (adversaryTurn != 1)
		$("#svgControls").html(svgControlData);
	
	buildHeader();
	
	document.getElementById('roomHeaderText').textContent = adversaryName;
	document.getElementById('roomSubHeaderText').textContent = "HP:" + adversaryHitPoints + "/" + adversaryMaxHitPoints + " DMG:+" + adversaryDamage + " ARM:-" + adversaryProtection;

	if (adversaryTurn == 1) {		
		terminalTimeout = setTimeout(function () {
			adversaryAttack(adversaryID);
		}, 1800);
	}
}

function attackWeapon(adversaryID) {
	var level = playerData.realmLevelIndex;
	var strength = playerData.playerStrength;
	var currentWeaponIndex = playerData.currentWeaponIndex;
	var adversaryName = adversaryData[adversaryID].adversaryName;
	var adversaryProtection = adversaryData[adversaryID].adversaryProtection;
	var adversaryHitPoints = adversaryData[adversaryID].adversaryHitPoints;
	var roll;
	var maxRoll = realmData.Levels[level].levelRollMax;
	var adversaryRoll = realmData.Levels[level].levelAdversaryRoll;
	var playerDamage = treasureData[currentWeaponIndex].treasureDamage;
	var adversaryTurn = null;
	var returnMessage;
		
	$("#svgControls").empty().html("");
	displayTerminal("Weapon attack!");
	updatePlayerMoves(null);
	roll = getRoll(1, maxRoll + 1);	
	terminalTimeout = setTimeout(function () {
		if (roll <= strength + adversaryRoll) {
			returnMessage = "You hit the " + adversaryName + " and do " + playerDamage + " damage.";
			adversaryHitPoints -= playerDamage;
			if (adversaryHitPoints <= 0 ) {				
				adversaryDefeated(adversaryID, playerDamage);
				return;	
			}
			adversaryData[adversaryID].adversaryHitPoints = adversaryHitPoints;
		}
		else
			returnMessage = "You miss!";
		adversaryTurn = 1;
		buildAdversary(adversaryID, null, returnMessage, adversaryTurn);
	}, 1200);
}

function attackMagic(adversaryID) {
	var level = playerData.realmLevelIndex;
	var intelligence = playerData.playerIntelligence;
	var currentMagicIndex = playerData.currentMagicIndex;
	var adversaryName = adversaryData[adversaryID].adversaryName;
	var adversaryProtection = adversaryData[adversaryID].adversaryProtection;
	var adversaryHitPoints = adversaryData[adversaryID].adversaryHitPoints;
	var roll;
	var maxRoll = realmData.Levels[level].levelRollMax;
	var adversaryRoll = realmData.Levels[level].levelAdversaryRoll;
	var playerDamage = treasureData[currentMagicIndex].treasureDamage;
	var adversaryTurn = null;
	var returnMessage;
		
	$("#svgControls").empty().html("");
	displayTerminal("Magic attack!");
	updatePlayerMoves(null);
	playerData.currentMagicCount = playerData.playerMoves;
	roll = getRoll(1, maxRoll + 1);	
	terminalTimeout = setTimeout(function () {
		if (roll <= intelligence + adversaryRoll) {
			returnMessage = "You hit the " + adversaryName + " and do " + playerDamage + " damage.";
			adversaryHitPoints -= playerDamage;
			if (adversaryHitPoints <= 0 ) {
				adversaryDefeated(adversaryID, playerDamage);
				return;	
			}
			adversaryData[adversaryID].adversaryHitPoints = adversaryHitPoints;
		}
		else
			returnMessage = "You miss!";
		adversaryTurn = 1;
		buildAdversary(adversaryID, null, returnMessage, adversaryTurn);
	}, 1200);
}

function attackCombo(adversaryID) {
	var level = playerData.realmLevelIndex;
	var strength = playerData.playerStrength;
	var intelligence = playerData.playerIntelligence;
	var currentWeaponIndex = playerData.currentWeaponIndex;
	var currentMagicIndex = playerData.currentMagicIndex;
	var adversaryName = adversaryData[adversaryID].adversaryName;
	var adversaryProtection = adversaryData[adversaryID].adversaryProtection;
	var adversaryHitPoints = adversaryData[adversaryID].adversaryHitPoints;
	var roll;
	var maxRoll = realmData.Levels[level].levelRollMax;
	var adversaryRoll = realmData.Levels[level].levelAdversaryRoll;
	var playerWeaponDamage = treasureData[currentWeaponIndex].treasureDamage;
	var playerMagicDamage = treasureData[currentMagicIndex].treasureDamage;
	var playerDamage = playerWeaponDamage + playerMagicDamage;
	var adversaryTurn = null;
	var returnMessage;
		
	$("#svgControls").empty().html("");
	displayTerminal("Combo attack!");
	updatePlayerMoves(null);
	playerData.currentMagicCount = playerData.playerMoves;
	roll = getRoll(1, maxRoll + 1);	
	terminalTimeout = setTimeout(function () {
		if (roll <= (strength + intelligence) + adversaryRoll) {
			returnMessage = "You hit the " + adversaryName + " and do " + playerDamage + " damage.";
			adversaryHitPoints -= playerDamage;
			if (adversaryHitPoints <= 0 ) {
				adversaryDefeated(adversaryID, playerDamage);
				return;	
			}
			adversaryData[adversaryID].adversaryHitPoints = adversaryHitPoints;
		}
		else
			returnMessage = "You miss!";
		adversaryTurn = 1;
		buildAdversary(adversaryID, null, returnMessage, adversaryTurn);
	}, 1200);
}

function attackHeal(adversaryID) {
	var level = playerData.realmLevelIndex;
	var maxHP = playerData.playerMaxHitPoints;
	var numPotions = playerData.playerPotions;
	var returnMessage = "Hit Points restored!";
	
	$("#svgControls").empty().html("");
	displayTerminal("Guzzling potion..");
	updatePlayerMoves(null);
	numPotions = numPotions - 1;
	playerData.playerHitPoints = maxHP;
	playerData.playerPotions = numPotions;
	localStorage.assign('playerData', {playerHitPoints: maxHP, playerPotions: numPotions});
	
	terminalTimeout = setTimeout(function () {
		buildAdversary(adversaryID, null, returnMessage, 1);
	}, 1200);
}

function runAway(adversaryID) {
	var totalRan = playerData.playerRan;
	var moves = playerData.playerMoves;
	var level = playerData.realmLevelIndex;
	var movesToAdd = realmData.Levels[level].levelRunMoves;
	var adversaryName = adversaryData[adversaryID].adversaryName;
	var adversaryDamage = adversaryData[adversaryID].adversaryDamage;
	var playerDexterity = playerData.playerDexterity;
	var playerLuck = playerData.playerLuck;
	var playerHitPoints = playerData.playerHitPoints;
	var currentArmorIndex = playerData.currentArmorIndex;
	var terminalText = "You run for your life!";
	var maxRoll = realmData.Levels[level].levelRollMax;
	var roll;
	
	totalRan += 1;
	moves += movesToAdd;
	roll = getRoll(1, maxRoll + 1);
	if (roll > (playerDexterity + playerLuck)) {
		terminalText = "You run for your life but the " + adversaryName + " gets one last swipe at you..";
		roll = getRoll(1, maxRoll + 1);
		if (roll > playerDexterity) {
			playerHitPoints -= adversaryDamage;
			terminalText += "<p>..and hits for " + adversaryDamage + " damage.<p>";
			if (playerHitPoints <= 0) {
				playerDied(terminalText);
				return;
			}
			playerData.playerHitPoints = playerHitPoints;
			localStorage.assign('playerData', {playerHitPoints: playerHitPoints});
		}
		else {
			terminalText += "<p>..and misses.";
		}
	}
	playerData.playerRan = totalRan;
	playerData.playerMoves = moves;
	playerData.realmRoomIndex = 0;
	localStorage.set('playerData', playerData);
	
	$("#svgControls").empty().html("");
	$("#mainMenuButton").addClass("hidden");
	displayTerminal(terminalText);
	
	terminalTimeout = setTimeout(function () {
		loadCurrentGame("You escaped but it cost " + movesToAdd + " moves.");
	}, 2100);
}

function adversaryAttack(adversaryID) {
	var level = playerData.realmLevelIndex;
	var adversaryName = adversaryData[adversaryID].adversaryName;
	var adversaryDamage = adversaryData[adversaryID].adversaryDamage;
	var roll;
	var maxRoll = realmData.Levels[level].levelRollMax;
	var playerDexterity = playerData.playerDexterity;
	var playerHitPoints = playerData.playerHitPoints;
	var currentArmorIndex = playerData.currentArmorIndex;
	var playerDead = 0;
	var returnMessage;
	
	returnMessage = "The " + adversaryName + " attacks ";
	roll = getRoll(1, maxRoll + 1);
	if (roll > playerDexterity) {
		playerHitPoints -= adversaryDamage;
		returnMessage += " and hits for " + adversaryDamage + " damage.<p>";
		if (playerHitPoints <= 0) {
			playerDead = 1;	
			playerDied(returnMessage);
			return;
		}
		else {
			playerData.playerHitPoints = playerHitPoints;
			localStorage.assign('playerData', {playerHitPoints: playerHitPoints});
		}
	}
	else {
		returnMessage += " and misses.";
	}
	if (playerDead != 1)
		buildAdversary(adversaryID, null, returnMessage, null);
}

function adversaryDefeated(adversaryID, playerDamage) {
	var level = playerData.realmLevelIndex;
	var room = playerData.realmRoomIndex;
	var adversaryName = adversaryData[adversaryID].adversaryName;
	var adversaryExperience = adversaryData[adversaryID].adversaryExperience;
	var adversaryTreasure = adversaryData[adversaryID].adversaryTreasure;
	var adversaryTreasureRandom = adversaryData[adversaryID].adversaryTreasureRandom;
	var hasTreasure = null;
	var foundTreasure = null;
	var returnMessage = "You hit and do " + playerDamage + " damage.<p>The " + adversaryName + " has been defeated!<p>You gained " + adversaryExperience + " XP.";
	
	// var foundInMorgue = 0;
	// for (j in morgueData) {
		// x = morgueData[j].morgueID;
		// y = morgueData[j].morgueType;
		// if (y == "D"){
			// if (x == adversaryID) {
				// morgueData[j].morgueCount += 1;
				// foundInMorgue = 1;
			// }
		// }
	// }
	// if (foundInMorgue == 0) {
		// var morgueDate = new Date();
		// morgueData.push({"morgueID": adversaryID, "morgueType": "D", "morgueDate": morgueDate.toString(), "morgueCount": 1});
	// }
	addToMorgue(adversaryID, "D");
	
	playerData.playerExperience += adversaryExperience;
	realmData.Levels[level].Rooms[room].roomAdversaryID = null;
	adversaryData[adversaryID].adversaryHitPoints = adversaryData[adversaryID].adversaryMaxHitPoints;
	
	if (adversaryTreasure != null) {
		hasTreasure = 1;
		foundTreasure = adversaryTreasure;
	}
	else if (adversaryTreasureRandom != null) {
		var treasureIndex = [];
		for (j in treasureData) {
			y = treasureData[j].treasureAllowRandom;
			if (y == 1){
				var treasureMaxSpawn = treasureData[j].treasureMaxSpawn;
				if (treasureMaxSpawn != 0) {
					var treasureLevelMin = treasureData[j].treasureMinLevel;
					var treasureLevelMax = treasureData[j].treasureMaxLevel;
					if (treasureLevelMin == null)
						treasureLevelMin = 0;
					if (treasureLevelMax == null)
						treasureLevelMax = 999;
					if (treasureLevelMin <= (level + 1) && treasureLevelMax >= (level + 1)) {								
						treasureIndex.push(j);
					}
				}
			}
		}
		var maxRoll = realmData.Levels[level].levelRollMax;
		var roll = getRoll(1, maxRoll + 1);
		var level = playerData.realmLevelIndex;
		var treasureRoll = realmData.Levels[level].levelTreasureRoll;
		var perception = playerData.playerPerception;
		if (roll <= (perception + treasureRoll)) {	
			hasTreasure = 1;		
			var numTreasures = treasureIndex.length;
			var whichTreasure = 0;
			if (numTreasures > 1) {
				whichTreasure = getRoll(0, numTreasures);
			}
			foundTreasure = treasureIndex[whichTreasure];	
			//alert(foundTreasure);
		}
	}
	
	localStorage.set('playerData', playerData);
	localStorage.set('adversaryData', adversaryData);
	//localStorage.set('morgueData', morgueData);
	localStorage.set('realmData', realmData);
	
	if (hasTreasure == null)
		loadCurrentGame(returnMessage);
	else {
		returnMessage += "<p>You found treasure..";
		buildAdversaryTreasure(foundTreasure, returnMessage);
	}
}

function buildAdversaryTreasure(foundTreasure, returnMessage) {
	var svgControlData = '<g class="buttonGroup" id="" onclick="showAdversaryTreasure(' + foundTreasure + ')"><rect x="1" y="15" width="104" height="40" fill="#282828" class="button" /><text x="52" y="40" fill="#41FF00" text-anchor="middle">Collect</text></g>';
	$("#svgControls").empty().html("");
	
	displayTerminal(returnMessage);	
	$("#svgControls").html(svgControlData);
}

function showAdversaryTreasure(foundTreasure) {
	var returnMessage = addTreasure(foundTreasure);
	loadCurrentGame(returnMessage);
}

function checkExitObstacles(direction, exitID, levelID) {
	var obstacleType = null;
	var level = playerData.realmLevelIndex;
	var room = playerData.realmRoomIndex;
	var exitDirection = realmData.Levels[level].Rooms[room].Exits[exitID].exitDirection;
	var isLocked = realmData.Levels[level].Rooms[room].Exits[exitID].exitLocked;
	var isBlocked = realmData.Levels[level].Rooms[room].Exits[exitID].exitBlocked;
	var isTrapped = realmData.Levels[level].Rooms[room].Exits[exitID].exitTrapped;
	
	if (isBlocked == 2) {
		realmData.Levels[level].Rooms[room].Exits[exitID].exitBlocked = 1;
		$("#obstacle" + exitDirection).removeClass("hidden");
		obstacleType = 1;
		localStorage.set('realmData', realmData);
	}
	else if (isBlocked == 1) 
		obstacleType = 1;
	else if (isLocked == 2) {
		realmData.Levels[level].Rooms[room].Exits[exitID].exitLocked = 1
		$("#obstacle" + exitDirection).removeClass("hidden");
		obstacleType = 2;
		localStorage.set('realmData', realmData);
	}
	else if (isLocked == 1)
		obstacleType = 2;
	else if (isTrapped == 2) {
		realmData.Levels[level].Rooms[room].Exits[exitID].exitTrapped = 1;
		$("#obstacle" + exitDirection).removeClass("hidden");
		obstacleType = 3;
		localStorage.set('realmData', realmData);
	}
	else if (isTrapped == 1) 
		obstacleType = 3;	
	
	
	if (obstacleType != null) {
		updatePlayerMoves(null);
		buildHeader();	
		buildObstacle(obstacleType, direction, exitID, levelID);
		return "obstacle";
	}
	
	return "ok";
}

function buildObstacle(obstacleType, direction, exitID, levelID) {
	var level = playerData.realmLevelIndex;
	var room = playerData.realmRoomIndex;
	var playerMagic = playerData.currentMagicIndex;
	var exitObstacle = "";
	var terminalText = "";
	var svgControlData = '';
	
	if (obstacleType == 1) {
		exitObstacle = "Exit Blocked";
		terminalText = "Shove (STR) or blast (INT) this obstacle.";
		svgControlData += '<g class="buttonGroup" id="" onclick="removeObstacle(1, ' + direction + ', ' + exitID + ', ' + levelID + ')"><rect x="1" y="15" width="104" height="40" fill="#282828" class="button" /><text x="52" y="40" fill="#41FF00" text-anchor="middle">Shove</text></g>';
		if (playerMagic != null)
			svgControlData += '<g class="buttonGroup" id="" onclick="removeObstacle(2, ' + direction + ', ' + exitID + ', ' + levelID + ')"><rect x="125" y="15" width="104" height="40" class="button" /><text x="177" y="40" fill="#41FF00" text-anchor="middle">Blast</text></g>';
		else {
			terminalText += "<p>Magic item required for blasting.";
			svgControlData += '<g><rect x="125" y="15" width="104" height="40" class="buttonDisabled" /><text x="177" y="40" fill="#207f00" text-anchor="middle">Blast</text></g>';
		}
	}
	else if (obstacleType == 2) {
		exitObstacle = "Exit Locked";
		terminalText = "Pick (DEX) or kick (STR) this lock.";
		svgControlData += '<g class="buttonGroup" id="" onclick="removeObstacle(3, ' + direction + ', ' + exitID + ', ' + levelID + ')"><rect x="1" y="15" width="104" height="40" fill="#282828" class="button" /><text x="52" y="40" fill="#41FF00" text-anchor="middle">Pick</text></g><g class="buttonGroup" id="" onclick="removeObstacle(4, ' + direction + ', ' + exitID + ', ' + levelID + ')"><rect x="125" y="15" width="104" height="40" class="button" /><text x="177" y="40" fill="#41FF00" text-anchor="middle">Kick</text></g>';
	}
	else if (obstacleType == 3) {
		exitObstacle = "Exit Trapped";
		terminalText = "Disarm (DEX) or ignore (LCK) the trap.";
		svgControlData += '<g class="buttonGroup" id="" onclick="removeObstacle(5, ' + direction + ', ' + exitID + ', ' + levelID + ')"><rect x="1" y="15" width="104" height="40" fill="#282828" class="button" /><text x="52" y="40" fill="#41FF00" text-anchor="middle">Disarm</text></g><g class="buttonGroup" id="" onclick="removeObstacle(6, ' + direction + ', ' + exitID + ', ' + levelID + ')"><rect x="125" y="15" width="104" height="40" class="button" /><text x="177" y="40" fill="#41FF00" text-anchor="middle">Ignore</text></g>';
	}
	
	svgControlData += '<g class="buttonGroup" id="" onclick="loadCurrentGame(null)"><rect x="376" y="15" width="103" height="40" class="button" /><text x="427" y="40" fill="#41FF00" text-anchor="middle">< Back</text></g>';
	
	$("#svgControls").empty().html("");
	
	displayTerminal(terminalText);	
	$("#svgControls").html(svgControlData);
	buildHeader();
	
	document.getElementById('roomHeaderText').textContent = exitObstacle;
}

function removeObstacle(attemptID, direction, exitID, levelID) {
	var roll, probability;
	var level = playerData.realmLevelIndex;
	var room = playerData.realmRoomIndex;
	var maxRoll = realmData.Levels[level].levelRollMax;
	var playerStrength = playerData.playerStrength;
	var playerIntelligence = playerData.playerIntelligence;
	var playerDexterity = playerData.playerDexterity;
	var playerLuck = playerData.playerLuck;
	var playerExperience = playerData.playerExperience;
	var obstacleRoll = realmData.Levels[level].levelObstacleRoll;
	var obstacleXP = realmData.Levels[level].levelSecretDoorXP;
	var failed = 1;
	var terminalText = "";
	var resultMessage = "You were unsuccessful.";
	
	roll = getRoll(1, maxRoll + 1);
	if (attemptID == 1) {
		terminalText = "Shoving..";
		probability = getProbability(playerStrength + obstacleRoll);
		if (roll <= (probability)) {
			failed = null;
			resultMessage = "Obstruction shoved clear!<p> You gained " + obstacleXP + " XP.";
			realmData.Levels[level].Rooms[room].Exits[exitID].exitBlocked = null;
		}
	}
	else if (attemptID == 2) {
		terminalText = "Blasting..";
		probability = getProbability(playerIntelligence + obstacleRoll);
		if (roll <= (probability)) {
			failed = null;
			resultMessage = "Obstruction blasted away!<p> You gained " + obstacleXP + " XP.";
			realmData.Levels[level].Rooms[room].Exits[exitID].exitBlocked = null;
		}
	}
	else if (attemptID == 3) {
		terminalText = "Picking..";
		probability = getProbability(playerDexterity + obstacleRoll);
		if (roll <= (probability)) {
			failed = null;
			resultMessage = "You picked the lock!<p> You gained " + obstacleXP + " XP.";
			realmData.Levels[level].Rooms[room].Exits[exitID].exitLocked = null;
		}
	}
	else if (attemptID == 4) {
		terminalText = "Kicking..";
		probability = getProbability(playerStrength + obstacleRoll);
		if (roll <= (probability)) {
			failed = null;
			resultMessage = "You kicked it down!<p> You gained " + obstacleXP + " XP.";
			realmData.Levels[level].Rooms[room].Exits[exitID].exitLocked = null;
		}
	}
	else if (attemptID == 5) {
		terminalText = "Disarming..";
		probability = getProbability(playerDexterity + obstacleRoll);
		if (roll <= (probability)) {
			failed = null;
			resultMessage = "You disarmed it!<p> You gained " + obstacleXP + " XP.";
			realmData.Levels[level].Rooms[room].Exits[exitID].exitTrapped = null;
		}
	}
	else if (attemptID == 6) {
		terminalText = "Ignoring..";
		probability = getProbability(playerLuck + obstacleRoll);
		if (roll <= (probability)) {
			failed = null;
			resultMessage = "You ignore the trap.<p> You gained " + obstacleXP + " XP.";
			realmData.Levels[level].Rooms[room].Exits[exitID].exitTrapped = null;
		}
	}
	
	$("#svgControls").empty().html("");
	displayTerminal(terminalText);
	setTimeout(function () {
		displayTerminal(resultMessage);
		terminalTimeout = setTimeout(function () {
			if (failed == null) {	
				playerExperience += obstacleXP;
				playerData.playerExperience = playerExperience;			
				localStorage.set('playerData', playerData);
				localStorage.set('realmData', realmData);
				playerMove(direction, null, levelID);
			}
			else
				checkExitObstacles(direction, exitID, levelID);
		}, 1900);
	}, 1000);
}

function playerDied(beforeYouGo) {
	var totalRevived = playerData.playerRevived;
	var moves = playerData.playerMoves;
	var level = playerData.realmLevelIndex;
	var movesToAdd = realmData.Levels[level].levelDeadMoves;
	var divideHP = realmData.Levels[level].levelDeadHPDivider;
	var maxHitPoints = playerData.playerMaxHitPoints;
	var divideHitPoints = Math.round(maxHitPoints / divideHP);
	totalRevived += 1;
	moves += movesToAdd;
	var returnMessage = "..and magically come back to life!<p>Though you feel like you have gone through a meat grinder. <p>" + divideHitPoints + " hit points have been restored and " + movesToAdd + " moves added.";
	playerData.playerHitPoints = 0;
	buildHeader();
	playerData.playerHitPoints = divideHitPoints;
	playerData.playerRevived = totalRevived;
	playerData.playerMoves = moves;
	playerData.realmRoomIndex = 0;
	localStorage.set('playerData', playerData);
	
	$("#svgControls").empty().html("");
	$("#mainMenuButton").addClass("hidden");
	displayTerminal(beforeYouGo + "Oh darn! You appear to have died..");
	setTimeout(function () {
		$("#mainGame").fadeOut(3000, "linear");
		terminalTimeout = setTimeout(function () {
			$("#mainGame").fadeIn(2300);
			$("#mainMenuButton").removeClass("hidden");
			loadCurrentGame(returnMessage);
		}, 3100);
	}, 1200);
}

function searchRoom() {
	var x,y;
	var moves = playerData.playerMoves;
	var level = playerData.realmLevelIndex;
	var room = playerData.realmRoomIndex;
	var perception = playerData.playerPerception;
	var playerExperience = playerData.playerExperience;
	var treasureRoll = realmData.Levels[level].levelTreasureRoll;
	var maxRoll = realmData.Levels[level].levelRollMax;
	var treasureID = realmData.Levels[level].Rooms[room].roomTreasureID;
	var treasureRandom = realmData.Levels[level].Rooms[room].roomTreasureRandom;
	var secretDoorXP = realmData.Levels[level].levelSecretDoorXP;
	var treasureIndex = [];
	var treasureLevelMin;
	var treasureLevelMax;
	var treasureMaxSpawn;
	var secretIndex = [];
	var searchType = 0;
	var returnMessage = "hmmm";
	var whichMessage = getRoll(0, 4);
	
	if (whichMessage == 0)
		returnMessage = "You find nothing.";
	if (whichMessage == 1)
		returnMessage = "A lesson in futility?";
	if (whichMessage == 2)
		returnMessage = "Your search was fruitless.";
	if (whichMessage == 3)
		returnMessage = "Everything seems in order.";
	
	updatePlayerMoves(null);
	
	for (j in realmData.Levels[level].Rooms[room].Exits) {
		x = realmData.Levels[level].Rooms[room].Exits[j].exitSecret;
		if (x == 1){
			secretIndex.push(j);
		}
	}	
	
	if (treasureRandom != null) {
		for (j in treasureData) {
			y = treasureData[j].treasureAllowRandom;
			if (y == 1){
				treasureMaxSpawn = treasureData[j].treasureMaxSpawn;
				if (treasureMaxSpawn != 0) {
					treasureLevelMin = treasureData[j].treasureMinLevel;
					treasureLevelMax = treasureData[j].treasureMaxLevel;
					if (treasureLevelMin == null)
						treasureLevelMin = 0;
					if (treasureLevelMax == null)
						treasureLevelMax = 999;
					if (treasureLevelMin <= (level + 1) && treasureLevelMax >= (level + 1)) {								
						treasureIndex.push(j);
					}
				}
			}
		}
	}
	
	if (treasureID != null) {
		treasureMaxSpawn = treasureData[treasureID].treasureMaxSpawn;
		if (treasureMaxSpawn == 0)
			treasureID = null;
	}
	
	if ((treasureIndex != "" || treasureID != null) && secretIndex != "") {
		searchType = getRoll(1, 3);
	}
	else if (treasureIndex != "" || treasureID !=null) {
		searchType = 1;
	}
	else if (secretIndex != "") {
		searchType = 2;
	}
	
	var roll = getRoll(1, maxRoll + 1);
	if (roll <= (perception + treasureRoll)) {		
		if (searchType == 1){
			var treasureType = 0;
			var foundTreasure;
			if (treasureID != null)
				treasureType = 1;
			if (treasureType == 0) {
				var numTreasures = treasureIndex.length;
				var whichTreasure = 0;
				if (numTreasures > 1) {
					whichTreasure = getRoll(0, numTreasures);
				}
				foundTreasure = treasureIndex[whichTreasure];
			}
			else {
				foundTreasure = treasureID;
			}
			
			if (treasureType == 0) {
				if (treasureRandom == 1)
					realmData.Levels[level].Rooms[room].roomTreasureRandom = null;
				else
					realmData.Levels[level].Rooms[room].roomTreasureRandom = treasureRandom - 1;
			}
			else
				realmData.Levels[level].Rooms[room].roomTreasureID = null;
			
			localStorage.set('realmData', realmData);			
			returnMessage = addTreasure(foundTreasure);
		}
		else if (searchType == 2) {
			var foundSecrets = playerData.playerFoundSecrets;
			var numDoors = secretIndex.length;
			var whichDoor = 0;
			if (numDoors > 1) {
				whichDoor = getRoll(0, numDoors);
			}
			var secretDoor = secretIndex[whichDoor];
			var secretDoorDirection = realmData.Levels[level].Rooms[room].Exits[secretDoor].exitDirection;			
			returnMessage = "You find a secret door leading " + secretDoorDirection + "! <p>You earned " + secretDoorXP + " XP.";
			realmData.Levels[level].Rooms[room].Exits[secretDoor].exitSecret = null;
			
			foundSecrets += 1;
			playerData.playerFoundSecrets = foundSecrets;
			playerExperience += secretDoorXP;
			playerData.playerExperience = playerExperience;
			
			localStorage.set('playerData', playerData);
			localStorage.set('realmData', realmData);
		}
	}
	$("#svgControls").empty().html("");	
	displayTerminal("Searching..");
	buildHeader();
	terminalTimeout = setTimeout(function () {
		loadCurrentGame(returnMessage);
	}, 1000);	
}

function addTreasure(foundTreasure) {
	var treasureName = treasureData[foundTreasure].treasureName;
	treasureType = treasureData[foundTreasure].treasureType;  
	treasureMaxSpawn = treasureData[foundTreasure].treasureMaxSpawn;
	var treasureProtection = treasureData[foundTreasure].treasureProtection; 
	var treasureDamage = treasureData[foundTreasure].treasureDamage; 
	var treasureExperience = treasureData[foundTreasure].treasureExperience; 
	var treasureValue = treasureData[foundTreasure].treasureValue;
	var playerGold = playerData.playerGold;
	var playerPotions = playerData.playerPotions;
	var playerArmor = playerData.currentArmorIndex;
	var playerArmorProtection = treasureData[playerArmor].treasureProtection;
	var playerWeapon = playerData.currentWeaponIndex;
	var playerWeaponDamage = treasureData[playerWeapon].treasureDamage;
	var playerMagic = playerData.currentMagicIndex;
	var playerExperience = playerData.playerExperience;
	var playerMagicDamage;
	returnMessage = "You find ";
	
	if (playerMagic != null)
		playerMagicDamage = treasureData[playerMagic].treasureDamage;
	else if (playerMagicDamage == null)
		playerMagicDamage = 0;
	
	if (treasureMaxSpawn != null)
		treasureData[foundTreasure].treasureMaxSpawn -= 1;
	
	if (treasureExperience != null) {
		playerExperience += treasureExperience;
		playerData.playerExperience = playerExperience;
	}
	else
		treasureExperience = 0;
	
	if (treasureType == "V") {
		returnMessage += treasureName + ".";
		if (treasureValue != null){
			playerGold += treasureValue;
			playerData.playerGold = playerGold;
			returnMessage += "<p>You collected "  + treasureValue + " GLD and gained " + treasureExperience + " XP.";
		}
	}
	else if (treasureType == "P") {
		returnMessage += "a " + treasureName + ".";
		playerPotions += 1;
		playerData.playerPotions = playerPotions;
		returnMessage += "<p>You gained " + treasureExperience + " XP.";
	}
	else if (treasureType == "A") {
		returnMessage += "-" + treasureProtection + " " + treasureName + ".";
		if (treasureProtection >= playerArmorProtection) {
			var currentArmorIndex = playerData.currentArmorIndex;
			var currentTreasureValue = treasureData[currentArmorIndex].treasureValue;
			returnMessage += "<p>New armor equipped. ";
			if (currentTreasureValue != null) {
				playerGold += currentTreasureValue;
				playerData.playerGold = playerGold;
				returnMessage += "<p>Old armor exchanged for "  + currentTreasureValue + " GLD.";
			}
			playerData.currentArmorIndex = foundTreasure;
		}
		else {
			if (treasureValue != null){
				playerGold += treasureValue;
				playerData.playerGold = playerGold;
				returnMessage += "<p>Armor exchanged for "  + treasureValue + " GLD";
			}
		}
		returnMessage += "<p>You gained " + treasureExperience + " XP.";
	}
	else if (treasureType == "W") {
		returnMessage += "+" + treasureDamage + " " + treasureName + ".";		
		if (treasureDamage >= playerWeaponDamage) {
			var currentWeaponIndex = playerData.currentWeaponIndex;
			var currentTreasureValue = treasureData[currentWeaponIndex].treasureValue;
			returnMessage += "<p>New weapon equipped. ";
			if (currentTreasureValue != null) {
				playerGold += currentTreasureValue;
				playerData.playerGold = playerGold;
				returnMessage += "<p>Old weapon exchanged for "  + currentTreasureValue + " GLD.";
			}
			playerData.currentWeaponIndex = foundTreasure;
		}
		else {
			if (treasureValue != null) {
				playerGold += treasureValue;
				playerData.playerGold = playerGold;;
				returnMessage += "<p>Weapon exchanged for "  + treasureValue + " GLD.";
			}
		}
		returnMessage += "<p>You gained " + treasureExperience + " XP.";
	}
	else if (treasureType == "M") {
		returnMessage += "+" + treasureDamage + " " + treasureName + ".";
		if (treasureDamage >= playerMagicDamage) {
			var currentMagicIndex = playerData.currentMagicIndex;
			var currentTreasureValue;
			if (currentMagicIndex != null)
				currentTreasureValue = treasureData[currentMagicIndex].treasureValue;
			//else
			//	currentTreasureValue = 0;
			returnMessage += "<p>New magic equipped. ";
			if (currentTreasureValue != null) {
				playerGold += currentTreasureValue;
				playerData.playerGold = playerGold;
				returnMessage += "<p>Old magic exchanged for "  + currentTreasureValue + " GLD.";
			}
			playerData.currentMagicIndex = foundTreasure;
		}
		else {
			if (treasureValue != null) {
				playerGold += treasureValue;
				playerData.playerGold = playerGold;
				returnMessage += "<p>Magic exchanged for "  + treasureValue + " GLD.";
			}
		}
		returnMessage += "<p>You gained " + treasureExperience + " XP.";
	}

	// var foundInMorgue = 0;
	// for (j in morgueData) {
		// x = morgueData[j].morgueID;
		// y = morgueData[j].morgueType;
		// if (y == "A" || y == "W" || y == "M" || y == "V" || y == "P"){
			// if (x == foundTreasure) {
				// morgueData[j].morgueCount += 1;
				// foundInMorgue = 1;
			// }
		// }
	// }
	// if (foundInMorgue == 0) {
		// var morgueDate = new Date();
		// morgueData.push({"morgueID": foundTreasure, "morgueType": treasureType, "morgueDate": morgueDate.toString(), "morgueCount": 1});
	// }	
	addToMorgue(foundTreasure, treasureType);
	
	localStorage.set('playerData', playerData);
	localStorage.set('treasureData', treasureData);
	//localStorage.set('morgueData', morgueData);
	
	return returnMessage;
}

function checkStats(potion) {
	window.clearTimeout(terminalTimeout);
	var svgControlData, terminalText, playerMagic;
	var currentHP = playerData.playerHitPoints;
	var maxHP = playerData.playerMaxHitPoints;
	var numPotions = playerData.playerPotions;
	var abilityPoints = playerData.playerAbilityPoints;
	var merchantSummon = playerData.currentSummonCount;
	var merchantSummonMax = merchantData.merchantRespawnMoves;
	var armorIndex = playerData.currentArmorIndex;
	var weaponIndex = playerData.currentWeaponIndex;
	var magicIndex = playerData.currentMagicIndex;
	var playerArmor =  "-" + treasureData[armorIndex].treasureProtection + " " + treasureData[armorIndex].treasureName;
	var playerWeapon = "+" + treasureData[weaponIndex].treasureDamage + " " +treasureData[weaponIndex].treasureName
	if (magicIndex != null)
		playerMagic =  "+" + treasureData[magicIndex].treasureDamage + " " + treasureData[magicIndex].treasureName;
	else
		playerMagic = "None";
	
	svgControlData = '<g><rect x="1" y="15" width="104" height="40" class="buttonDisabled" /><text x="52" y="40" fill="#207f00" text-anchor="middle">Heal</text></g><g><rect x="125" y="15" width="104" height="40" class="buttonDisabled" /><text x="177" y="40" fill="#207f00" text-anchor="middle">Level Up</text></g><g><rect x="250" y="15" width="104" height="40" class="buttonDisabled" /><text x="302" y="40" fill="#207f00" text-anchor="middle">Summon</text></g><g class="buttonGroup" id="" onclick="loadCurrentGame(null)"><rect x="376" y="15" width="103" height="40" class="button" /><text x="427" y="40" fill="#41FF00" text-anchor="middle">< Back</text></g>';

	if (numPotions > 0 && (currentHP < maxHP)) { 
		svgControlData += '<g class="buttonGroup" onclick="takePotion()"><rect x="1" y="15" width="104" height="40" fill="#282828" class="button" /><text x="52" y="40" fill="#41FF00" text-anchor="middle">Heal</text></g>';
	}
	
	if (abilityPoints > 0) { 
		svgControlData += '<g class="buttonGroup" onclick="levelUp()"><rect x="125" y="15" width="104" height="40" class="button" /><text x="177" y="40" fill="#41FF00" text-anchor="middle">Level Up</text></g>';
	}
	
	if (playerData.playerMoves >= (merchantSummon + merchantSummonMax)) {
		svgControlData += '<g class="buttonGroup" onclick="summonMerchant()"><rect x="250" y="15" width="104" height="40" class="button" /><text x="302" y="40" fill="#41FF00" text-anchor="middle">Summon</text></g>';
	}
	
	terminalText = 'CLV:' + playerData.playerLevel + ' XP:' + playerData.playerExperience + ' AP:' + abilityPoints + '<br />STR:' + playerData.playerStrength + ' INT:' + playerData.playerIntelligence + ' PER:' + playerData.playerPerception + ' DEX:' + playerData.playerDexterity + ' LCK:' + playerData.playerLuck + '<p>GLD:' + playerData.playerGold + '<br />ARM:' + playerArmor + '<br />WPN:' + playerWeapon + '<br />MAG:' + playerMagic + '';
	
	$("#svgControls").empty().html("");	
	displayTerminal(terminalText);
	if (potion != 1)
		$("#svgControls").html(svgControlData);
	if (potion == 2)
		$("#merchant").addClass("hidden");
	
	document.getElementById('roomHeaderText').textContent = "Character Stuff";
	document.getElementById('roomSubHeaderText').textContent = "";
	
	buildHeader();
	if (potion == 1) {
		displayTerminal("Potion consumed.<p>You feel much better now.");
		terminalTimeout = setTimeout(function () {
			checkStats(null);
		}, 2000);
	}
}

function takePotion() {
	var maxHP = playerData.playerMaxHitPoints;
	var numPotions = playerData.playerPotions;
	
	numPotions = numPotions - 1;
	playerData.playerHitPoints = maxHP;
	playerData.playerPotions = numPotions;
	localStorage.assign('playerData', {playerHitPoints: maxHP, playerPotions: numPotions});
	
	checkStats(1);
}

function levelUp() {
	var svgControlData, terminalText;
	var abilityPoints = playerData.playerAbilityPoints;
	
	if (abilityPoints > 0) {
		svgControlData = '<g class="buttonGroup" id="" onclick="updateAbility(\'playerStrength\')"><rect x="1" y="15" width="104" height="40" class="button" /><text x="52" y="40" fill="#41FF00" text-anchor="middle">STR +1</text></g><g class="buttonGroup" id="" onclick="updateAbility(\'playerIntelligence\')"><rect x="125" y="15" width="104" height="40" class="button" /><text x="177" y="40" fill="#41FF00" text-anchor="middle">INT +1</text></g><g class="buttonGroup" id="" onclick="updateAbility(\'playerPerception\')"><rect x="250" y="15" width="104" height="40" class="button" /><text x="302" y="40" fill="#41FF00" text-anchor="middle">PER +1</text></g><g class="buttonGroup" id="" onclick="updateAbility(\'playerDexterity\')"><rect x="376" y="15" width="103" height="40" class="button" /><text x="427" y="40" fill="#41FF00" text-anchor="middle">DEX +1</text></g><g class="buttonGroup" id="" onclick="updateAbility(\'playerLuck\')"><rect x="1" y="70" width="104" height="40" id="" class="button" /><text x="52" y="95" fill="#41FF00" text-anchor="middle">LCK +1</text></g><g class="buttonGroup" id="" onclick="checkStats(null)"><rect x="125" y="70" width="104" height="40" id="" class="button" /><text x="177" y="95" fill="#41FF00" text-anchor="middle">< Back</text></g>';
	}
	else {
		svgControlData = '<g><rect x="1" y="15" width="104" height="40" class="buttonDisabled" /><text x="52" y="40" fill="#207f00" text-anchor="middle">STR +1</text></g><g><rect x="125" y="15" width="104" height="40" class="buttonDisabled" /><text x="177" y="40" fill="#207f00" text-anchor="middle">INT +1</text></g><g><rect x="250" y="15" width="104" height="40" class="buttonDisabled" /><text x="302" y="40" fill="#207f00" text-anchor="middle">PER +1</text></g><g><rect x="376" y="15" width="103" height="40" class="buttonDisabled" /><text x="427" y="40" fill="#207f00" text-anchor="middle">DEX +1</text></g><g><rect x="1" y="70" width="104" height="40" id="" class="buttonDisabled" /><text x="52" y="95" fill="#207f00" text-anchor="middle">LCK +1</text></g><g class="buttonGroup" id="" onclick="checkStats(null)"><rect x="125" y="70" width="104" height="40" id="" class="buttonDisabled" /><text x="177" y="95" fill="#41FF00" text-anchor="middle">< Back</text></g>';
	}
	
	terminalText = 'AP:' + abilityPoints + '<br/>-------<br />STR:' + playerData.playerStrength + '<br />INT:' + playerData.playerIntelligence + '<br />PER:' + playerData.playerPerception + '<br />DEX:' + playerData.playerDexterity + '<br />LCK:' + playerData.playerLuck;
	
	$("#svgControls").empty().html("");
	
	displayTerminal(terminalText);
	$("#svgControls").html(svgControlData);
	
	document.getElementById('roomHeaderText').textContent = "Level Up";
	document.getElementById('roomSubHeaderText').textContent = "Assign Ability Points";
}

function updateAbility(ability) {
	playerData.playerAbilityPoints = playerData.playerAbilityPoints - 1;
	if (ability == "playerStrength")
		playerData.playerStrength = playerData.playerStrength + 1;
	if (ability == "playerIntelligence")
		playerData.playerIntelligence = playerData.playerIntelligence + 1;
	if (ability == "playerPerception")
		playerData.playerPerception = playerData.playerPerception + 1;
	if (ability == "playerDexterity")
		playerData.playerDexterity = playerData.playerDexterity + 1;
	if (ability == "playerLuck")
		playerData.playerLuck = playerData.playerLuck + 1;
	localStorage.set('playerData', playerData);
	levelUp();
}

function summonMerchant() {
	var itemID, m, x, y, z;
	var playerGold = playerData.playerGold;
	var playerLevel = playerData.playerLevel;
	var realmLevelIndex = playerData.realmLevelIndex + 1;
	var playerArmor = playerData.currentArmorIndex;
	var playerArmorProtection = treasureData[playerArmor].treasureProtection;
	var playerWeapon = playerData.currentWeaponIndex;
	var playerWeaponDamage = treasureData[playerWeapon].treasureDamage;
	var playerMagic = playerData.currentMagicIndex;
	var playerMagicDamage = 0;
	var terminalText = '<table>';
	var merchantName = merchantData.merchantName;
	var merchantIndex = [];
	
	$("#merchant").removeClass("hidden");
	
	if (playerMagic != null)
		playerMagicDamage = treasureData[playerMagic].treasureDamage;
			
	var svgControlData = '<g><rect x="1" y="15" width="104" height="40" class="buttonDisabled" /><text x="52" y="40" fill="#207f00" text-anchor="middle">N/A</text></g><g><rect x="125" y="15" width="104" height="40" class="buttonDisabled" /><text x="177" y="40" fill="#207f00" text-anchor="middle">N/A</text></g><g><rect x="250" y="15" width="104" height="40" class="buttonDisabled" /><text x="302" y="40" fill="#207f00" text-anchor="middle">N/A</text></g><g><rect x="376" y="15" width="103" height="40" class="buttonDisabled" /><text x="427" y="40" fill="#207f00" text-anchor="middle">N/A</text></g><g><rect x="1" y="70" width="104" height="40" class="buttonDisabled" /><text x="52" y="95" fill="#207f00" text-anchor="middle">N/A</text></g><g><rect x="125" y="70" width="104" height="40" class="buttonDisabled" /><text x="177" y="95" fill="#207f00" text-anchor="middle">N/A</text></g><g><rect x="250" y="70" width="104" height="40" class="buttonDisabled" /><text x="302" y="95" fill="#207f00" text-anchor="middle">N/A</text></g><g class="buttonGroup" onclick="checkStats(2)"><rect x="376" y="70" width="103" height="40" class="button" /><text x="427" y="95" fill="#41FF00" text-anchor="middle">< Back</text></g>';
	
	for (j in merchantData.merchantItems) {
		itemID = merchantData.merchantItems[j].itemID;
		x = merchantData.merchantItems[j].itemMinPlayerLevel;
		y = merchantData.merchantItems[j].itemMinLevel;
		z = merchantData.merchantItems[j].itemMaxLevel;
		var merchantItemType = treasureData[itemID].treasureType;
		var merchantItemProtection = treasureData[itemID].treasureProtection;
		var merchantItemDamage = treasureData[itemID].treasureDamage;
		
		if (x == null)
			x = 0;
		
		if (y == null)
			y = 0;
		
		if (z == null)
			z = 999;

		if (itemID != playerArmor && itemID != playerWeapon && itemID != playerMagic) {
			if (playerLevel >= x && realmLevelIndex >= y && realmLevelIndex <= z) {
				if (merchantItemType == "P") 
					merchantIndex.push(j);		
				if (merchantItemType == "A" && merchantItemProtection >= playerArmorProtection) 
					merchantIndex.push(j);
				if (merchantItemType == "W" && merchantItemDamage >= playerWeaponDamage) 
					merchantIndex.push(j);
				if (merchantItemType == "M" && merchantItemDamage >= playerMagicDamage) {
					merchantIndex.push(j);
				}
			}
		}
	}
	
	for (j in merchantIndex) {
		m = merchantIndex[j];
		itemID = merchantData.merchantItems[merchantIndex[j]].itemID;
		m = merchantIndex[j];
		y = merchantData.merchantItems[merchantIndex[j]].itemValue;
		z = treasureData[itemID].treasureName;
		var treasureDamage = treasureData[itemID].treasureDamage;
		var treasureProtection = treasureData[itemID].treasureProtection;
		var treasureType = treasureData[itemID].treasureType;
		if (treasureType == "A") 
			z = "-" + treasureProtection + " " + z;
		if (treasureType == "W")  
			z = "+" + treasureDamage + " " + z;
		if (treasureType == "M")  
			z = "+" + treasureDamage + " " + z;
				
		
		if (j == 0){
			terminalText += '<tr style="padding: 0"><td>1</td><td>&nbsp;</td><td> ' + z + '</td><td>&nbsp;</td><td>' + y + '</tr>';
			if (playerGold >= y) 
				svgControlData += '<g class="buttonGroup" id="" onclick="purchaseItem(' + m + ')"><rect x="1" y="15" width="104" height="40" class="button" /><text x="52" y="40" fill="#41FF00" text-anchor="middle">Buy #1</text></g>';
			else
				svgControlData += '<g><rect x="1" y="15" width="104" height="40" class="buttonDisabled" /><text x="52" y="40" fill="#207f00" text-anchor="middle">Buy #1</text></g>';		
		}
		if (j == 1){
			terminalText += '<tr style="padding: 0"><td>2</td><td>&nbsp;</td><td> ' + z + '</td><td>&nbsp;</td><td>' + y + '</tr>';
			if (playerGold >= y) 
				svgControlData += '<g class="buttonGroup" id="" onclick="purchaseItem(' + m + ')"><rect x="125" y="15" width="104" height="40" class="button" /><text x="177" y="40" fill="#41FF00" text-anchor="middle">Buy #2</text></g>';
			else
				svgControlData += '<g><rect x="125" y="15" width="104" height="40" class="buttonDisabled" /><text x="177" y="40" fill="#207f00" text-anchor="middle">Buy #2</text></g>';			
		}
		if (j == 2){
			terminalText += '<tr><td>3</td><td>&nbsp;</td><td> ' + z + '</td><td>&nbsp;</td><td>' + y + '</tr>';
			if (playerGold >= y) 
				svgControlData += '<g class="buttonGroup" id="" onclick="purchaseItem(' + m + ')"><rect x="250" y="15" width="104" height="40" class="button" /><text x="302" y="40" fill="#41FF00" text-anchor="middle">Buy #3</text></g>';
			else
				svgControlData += '<g><rect x="250" y="15" width="104" height="40" class="buttonDisabled" /><text x="302" y="40" fill="#207f00" text-anchor="middle">Buy #3</text></g>';			
		}
		if (j == 3){
			terminalText += '<tr><td>4</td><td>&nbsp;</td><td> ' + z + '</td><td>&nbsp;</td><td>' + y + '</tr>';
			if (playerGold >= y) 
				svgControlData += '<g class="buttonGroup" id="" onclick="purchaseItem(' + m + ')"><rect x="376" y="15" width="104" height="40" class="button" /><text x="427" y="40" fill="#41FF00" text-anchor="middle">Buy #4</text></g>';
			else
				svgControlData += '<g><rect x="376" y="15" width="104" height="40" class="buttonDisabled" /><text x="427" y="40" fill="#207f00" text-anchor="middle">Buy #4</text></g>';			
		}
		if (j == 4){
			terminalText += '<tr><td>5</td><td>&nbsp;</td><td> ' + z + '</td><td>&nbsp;</td><td>' + y + '</tr>';
			if (playerGold >= y) 
				svgControlData += '<g class="buttonGroup" id="" onclick="purchaseItem(' + m + ')"><rect x="1" y="70" width="104" height="40" class="button" /><text x="52" y="95" fill="#41FF00" text-anchor="middle">Buy #5</text></g>';
			else
				svgControlData += '<g><rect x="1" y="70" width="104" height="40" class="buttonDisabled" /><text x="52" y="95" fill="#207f00" text-anchor="middle">Buy #5</text></g>';			
		}
		if (j == 5){
			terminalText += '<tr><td>6</td><td>&nbsp;</td><td> ' + z + '</td><td>&nbsp;</td><td>' + y + '</tr>';
			if (playerGold >= y) 
				svgControlData += '<g class="buttonGroup" id="" onclick="purchaseItem(' + m + ')"><rect x="125" y="70" width="104" height="40" class="button" /><text x="177" y="95" fill="#41FF00" text-anchor="middle">Buy #6</text></g>';
			else
				svgControlData += '<g><rect x="125" y="70" width="104" height="40" class="buttonDisabled" /><text x="177" y="95" fill="#207f00" text-anchor="middle">Buy #6</text></g>';			
		}
		if (j == 6){
			terminalText += '<tr><td>7</td><td>&nbsp;</td><td> ' + z + '</td><td>&nbsp;</td><td>' + y + '</tr>';
			if (playerGold >= y) 
				svgControlData += '<g class="buttonGroup" id="" onclick="purchaseItem(' + m + ')"><rect x="250" y="70" width="104" height="40" class="button" /><text x="302" y="95" fill="#41FF00" text-anchor="middle">Buy #7</text></g>';
			else
				svgControlData += '<g><rect x="250" y="70" width="104" height="40" class="buttonDisabled" /><text x="302" y="95" fill="#207f00" text-anchor="middle">Buy #7</text></g>';			
		}
	}
	terminalText += '</table>';
	
	$("#svgControls").empty().html("");
	displayTerminal(terminalText);
	$("#svgControls").html(svgControlData);
	
	document.getElementById('roomHeaderText').textContent = merchantName + " the Teleporting Merchant";
	document.getElementById('roomSubHeaderText').textContent = "You have " + playerGold + " Gold";
	
	playerData.currentSummonCount = playerData.playerMoves;
	localStorage.set('playerData', playerData);	
}

function purchaseItem(merchantRowID) {
	var treasureID = merchantData.merchantItems[merchantRowID].itemID;
	var itemValue = merchantData.merchantItems[merchantRowID].itemValue;
	var itemType = treasureData[treasureID].treasureType;
	var svgRoomData = '';
	
	playerData.playerGold -= itemValue;
	
	if (itemType == "A") {
		playerData.currentArmorIndex = treasureID;
	}
	if (itemType == "W") {
		playerData.currentWeaponIndex = treasureID;
	}
	if (itemType == "M") {
		playerData.currentMagicIndex = treasureID;
	}
	if (itemType == "P") {
		playerData.playerPotions += 1;
	}

	// var foundInMorgue = 0;
	// for (j in morgueData) {
		// x = morgueData[j].morgueID;
		// y = morgueData[j].morgueType;
		// if (y == "A" || y == "W" || y == "M" || y == "V" || y == "P"){
			// if (x == treasureID) {
				// morgueData[j].morgueCount += 1;
				// foundInMorgue = 1;
			// }
		// }
	// }
	// if (foundInMorgue == 0) {
		// var morgueDate = new Date();
		// morgueData.push({"morgueID": treasureID, "morgueType": itemType, "morgueDate": morgueDate.toString(), "morgueCount": 1});
	// }
	
	// if (playerData.currentWeaponIndex > 1)
		// $("#playerWeapon").removeClass("hidden");
	
	// if (playerData.currentMagicIndex != null)
		// $("#playerMagic").removeClass("hidden");
	
	addToMorgue(treasureID, itemType);
	
	$("#svgRoom").prepend(svgRoomData);
	
	localStorage.set('playerData', playerData);
	//localStorage.set('morgueData', morgueData);
	
	buildHeader();
	summonMerchant();
}

function addToMorgue(morgueID, morgueType) {
	var foundInMorgue = 0;
	for (j in morgueData) {
		x = morgueData[j].morgueID;
		y = morgueData[j].morgueType;
		if (y == morgueType){
			if (x == morgueID) {
				morgueData[j].morgueCount += 1;
				foundInMorgue = 1;
			}
		}
	}
	if (foundInMorgue == 0) {
		var morgueDate = new Date();
		morgueData.push({"morgueID": morgueID, "morgueType": morgueType, "morgueDate": morgueDate.toString(), "morgueCount": 1});
	}
	
	if (playerData.currentWeaponIndex > 1)
		$("#playerWeapon").removeClass("hidden");
	
	if (playerData.currentMagicIndex != null)
		$("#playerMagic").removeClass("hidden");
	
	localStorage.set('morgueData', morgueData);
}

function buildMorgue() {
	var x, y, z;
	var mType = "Unknown";
	var mDamage = "";
	var morgueContainer = "";
	$("#morgueContainer").empty().html("");
	morgueData = localStorage.get('morgueData');
	trapData = localStorage.get('trapData');
	adversaryData = localStorage.get('adversaryData');
	treasureData = localStorage.get('treasureData');
	
	for (j in morgueData) {
		x = morgueData[j].morgueID;
		y = morgueData[j].morgueType;
		z = morgueData[j].morgueCount;
		var itemName = "Unknown";
		var itemDescription = "No Description";
		
		if (y == "R" || y == "D" || y == "A" || y == "W" || y == "M" || y == "V" || y == "P") {
			if (y == "R") {
				mType = "Trap";
				mDamage = "";
				itemName = trapData[x].trapName;
				itemDescription = trapData[x].trapDescription;
			}
			if (y == "D") {
				mType = "Adversary";
				mDamage = "";
				itemName = adversaryData[x].adversaryName;
				itemDescription = adversaryData[x].adversaryDescription;
			}
			if (y == "A") {
				mType = "Armor";
				if (treasureData[x].treasureProtection != null)
					mDamage = "-" + treasureData[x].treasureProtection;
				itemName = treasureData[x].treasureName;
				itemDescription = treasureData[x].treasureDescription;
			}
			if (y == "W") {
				mType = "Weapon";
				if (treasureData[x].treasureDamage != null)
					mDamage = "+" + treasureData[x].treasureDamage;
				itemName = treasureData[x].treasureName;
				itemDescription = treasureData[x].treasureDescription;
			}
			if (y == "M") {
				mType = "Magic";
				if (treasureData[x].treasureDamage != null)
					mDamage = "+" + treasureData[x].treasureDamage;
				itemName = treasureData[x].treasureName;
				itemDescription = treasureData[x].treasureDescription;
			}
			if (y == "V") {			
				mType = "Valuable";
				mDamage = "";
				itemName = treasureData[x].treasureName;
				itemDescription = treasureData[x].treasureDescription;
			}
			if (y == "P") {
				mType = "Potion";
				mDamage = "";
				itemName = treasureData[x].treasureName;
				itemDescription = treasureData[x].treasureDescription;
			}
			
			if (itemDescription == null)
				itemDescription = "No description given.";
			morgueContainer += '<div class="morgueBox"><b>' + mDamage + ' ' + itemName + '</b><br />Type: ' + mType + ' &nbsp; Collected: ' + z + '<br />' + itemDescription + '</div>';
		}
	}
	if (morgueContainer != "")
		morgueContainer += '<a class="right" onclick="goToByScroll(\'mainMenuButton\')">[ Top ]</a><div><a class="right" onclick="showMenu()">[ Menu ]</a></div><p>';
	else
		morgueContainer = "<p>Nothing collected yet.";
	$("#morgueContainer").html(morgueContainer);
}

function getRoll(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getProbability(weight) {
	var level = playerData.realmLevelIndex;
	var maxRoll = realmData.Levels[level].levelRollMax;
	var probability = Math.abs(weight);
	if (probability == 0)
		probability = 1;
	if (probability >= maxRoll + 1)
		probability -= 1;
    return probability;
}