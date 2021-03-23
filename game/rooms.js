var weirdCmd
rooms = {
	"room_1": {
		desc: [
		"You're in a room.",
		"You're still in a room.",
		"Why don't you *leave* the room?",
		],
		tries:0,
		cmds: [
			{
				name: "leave",
				help: "",
				cmd: function (args, term, g){
					term.allowTyping = false
					term.print(". ")
					setTimeout(function (){
						term.update("..")
						setTimeout(function (){
							term.update("...")
							setTimeout(function (){
								term.print("Just Kidding, You can't leave this room.")
								term.allowTyping = true
								g.room.cmds.unshift({
									name: "*",
									help: "",
									cmd: function (args, term, g){
										term.print("I'm just fucking around! Look around, you're already \nin a different room!")
										g.room = rooms["room_2"]
										return true					
									},
								})

							}, 1200)
						}, 800)
					}, 800)
					
				},
			},
			{
				name: "hello",
				help: "",
				cmd: function(args,term,g){
					term.print("Hi. This game is called lk.")
				},
			},
			{
				name: "_",
				help: "",
				cmd: function(args,term,g){
					term.print("That command is way too advanced. ")
				}
			}
		]
	},
	"room_2": {
		desc: [
		"Yep, it's definitely a different room",
		"You think I'd give you another hint in the same way?\nBad design!!",
		],
		tries:0,
		cmds: [
			{
				//let's try a timeout function
				name: "*",
				help: "",
				cmd: function (args, term, g){
					g.room.vars.lastActionTime = new Date()
					setTimeout(function() {
						var now = new Date()
						var diff = now - g.room.vars.lastActionTime
						if(diff > 6450){
							term.allowTyping = false
							term.print(" ")
							term.print("wow, you must REALLY be stumped.")
							setTimeout(function() {
								term.print("This is my game.")
								setTimeout(function() {
									term.print("Do you think that you have any control?")
									term.allowTyping = true
									g.room = rooms["room_3"]
									g.room.initOverride(term, g)

								}, 1500);
							}, 1500);
						}
					}, 6500);	
				},
			},
			{
				name: "leave",
				help: "",
				cmd: function (args, term, g){
					term.print("It's not worth trying again.")					
				},
			},
		],
		vars :[

		],
	},
	//room where you have no control
	"room_3": {
		desc: [
		"Yep, it's definitely a different room",
		],
		tries:0,
		cmds: [
			{
				name: "*",
				help: "",
				cmd: function (args, term, g){
					term.print("Do you think that you have any control?")
					return true					
				},
			},
		],
		vars: [],
		initOverride: function(term,g){
			g.room.vars.stringPos = 0
			g.room.vars.actualInput = ''
			g.room.vars.overrideString = "No I don't"
			term.keyTypedControlOverride = function(keyCode, term,g) {
				if(g.room.vars.stringPos < g.room.vars.overrideString.length){
					term.input += g.room.vars.overrideString[g.room.vars.stringPos]
					term.cursorPos++
					g.room.vars.stringPos++
					g.room.vars.actualInput += keyCode
				}
				return true
			}
			term.keyPressedControlOverride = function(keyCode, term,g) {
				console.log("KEYCODE!!", keyCode)
				if(keyCode == "Backspace"){
					g.room.vars.stringPos = max(g.room.vars.stringPos - 1, 0)
					g.room.vars.actualInput = g.room.vars.actualInput.slice(0,g.room.vars.actualInput.length - 1)
				} 
				if(keyCode == "Enter"){
					console.log(g.room.vars.actualInput)
					g.room.vars.stringPos = 0
					if(g.room.vars.actualInput.toLowerCase().replace(/\W/,"") === g.room.vars.overrideString.toLowerCase().replace(/\W/,"") ){
						
						term.clear()
						term.input = ""
						term.cursorPos = 0
						term.keyPressedControlOverride = null
						term.keyTypedControlOverride = null
						g.room = rooms["room_4"]
						term.print("^Good Job, you made it past the tutorial^")
						return true
					}
					g.room.vars.actualInput = ""
				} 
				return false
			}
		}
	},
	"room_4": {
		desc: [
		"You are in a meadow. There is a cliff above you",
		"There are also some *rocks* on the ground.",
		"But yeah, the main focus is the *cliff*."
		],

		cmds: [
			{
				//let's try a timeout function
				name: "*",
				help: "",
				cmd: function (args, term, g){
				},
			},
			{
				name: "talk",
				cmd: function(args, term, g){
					g.room.objs[3].desc("",term,g)
				}
			}
		],
		objs:[
			{
				name: "meadow",
				desc: [
					"What a beautiful meadow!",
					"The grass is gistening moistly.",
				],
				move: [
					"fuck that!",
					"U Tryna get ticks, brah?",
				],
			},
			{
				name: "cliff",
				desc: [
					"it's a cliff. Is that a girl up there?",
				],
				move: [
					"The cliff doesn't *look* very climbable.",
					"Is that a girl up there?",
				],
			},
			{
				name: ["rocks", "rock"],
				desc: ["Why the fuck would you look at rocks?", 
				function (args,term,g){
					term.print("wait, actually there's a ^coin^ in there. You take it.")
					g.addToInventory({
						name:"coin",
						title: "a coin",
						desc:"It's a small lumpy coin",
						use: function(args,term,g){
							term.print("you wave the coin around in the air, but not much seems to happen.")
						}
					}, term)
					
				}, "good job"],
			},
						{
				name: ["girl"],
				desc: function(args,term,g){
					term.clear()
					console.log("play animation")
					//term.print("*ok cool, that's pretty much the end*")
					g.room = rooms["room_cliff"]
					g.room.setup(term,g)
					return ""
				}
			}

		],
		vars :[

		],
	},

	"room_cliff": {
		desc: [
		"cliff",
		],

		cmds: [],
		vars :[

		],
		setup: function(term,g){
			g.room.vars.girlY = -100
			g.room.vars.girlX = 130
			g.room.vars.save = false
			g.room.vars.drawBG = false
			g.room.vars.opac = 0
			g.room.vars.fallingRate = 2.5
			g.room.vars.secondTime = false
			term.drawOverride = g.room.draw

		},
		draw: function(term,g){
			if(g.room.vars.drawBG){
				g.room.vars.opac+= 1
				tint(255, g.room.vars.opac)
				image(saveGirlBG[round(g.room.vars.opac / 20) % 3], 0, 0)
				tint(255,255)
			}

			term.drawImage(girl_falling_img, g.room.vars.girlX, g.room.vars.girlY)
			if(!g.room.vars.save){
				
				g.room.vars.girlY += g.room.vars.fallingRate
				if(term.input.length > 7 && g.room.vars.girlY > (180)){
					g.room.vars.save = true
					term.keyPressedControlOverride = function(){
						return true
					}
					term.keyTypedControlOverride = function(){
						return true
					}
					setTimeout(function() {
						term.print("^You saved me.^")
						term.print("  ")
						g.room.vars.drawBG = true
						setTimeout(function() {
							term.update("^Thank you. What's your name?^")
							term.print("   ")
							setTimeout(function() {
								term.update("^Oh, it's^ " + term.input + ".")
								g.player.name = term.input
								term.print("   ")
								setTimeout(function() {
									term.update("^Thank you,^ " + term.input + ".")
									term.print("   ")
									setTimeout(function(){
										term.clear()
										term.drawOverride = null
										term.keyPressedControlOverride = null
										term.keyTypedControlOverride = null
										term.input = ""
										if(g.room.vars.secondTime){
											//saved_girl_twice TODO
											g.room = rooms["saved_girl"]
											g.room.setup(term,g)
										}
										else g.room = rooms["saved_girl"]
									}, 3000)
								}, 3000);
							}, 3500);
						}, 3000);
					}, 1500);
					
				}
				else if(g.room.vars.girlY > 50){
					term.clear()
					term.drawOverride = null
					if(g.room.vars.secondTime){

						g.room = rooms["killed_girl_twice"]
						g.room.setup(term,g)
					}
					else g.room = rooms["killed_girl"]
				}
			}

			


			return false
		},
	},






	"killed_girl" : {
		desc: [
			"The base of a cliff. There's a dead girl on the ground.",
			"There's a path leading up the cliff and another path leading back in time",
		] ,
		objs: [
			{
				name: ["girl"],
				desc: [
					"She's dead.",
					"She looked like a Sarah. Maybe a Jennifer.",
					"You could have saved her. It's too late now.",
					"This game isn't a staring-at-dead-girls simulator."
				],
			},
			{
				name: ["back", "backwards", "before"],
				move: [
					function(args,term,g){
						g.room = rooms["room_cliff"]
						g.room.setup(term,g)
						g.room.vars.fallingRate = 6
						g.room.vars.secondTime = true
						term.clear()
					}
				]
			},
			{
				name: ["up", "cliff", "path"],
				move: [
					function(args,term,g){
						g.room = rooms["climb_cliff"]
						g.room.setup(term,g)
					}
				]
			},
		],
		cmds: [
			{
				name: ["rip", "oops", "shit", "fuck"],
				cmd: function(args,term,g){
					term.print("indeed.")
				},
			},
			weirdCmd,
			{
				name: "talk",
				cmd: function(args,term,g){
					term.print("The fuck do you think will happen?")
				}
			},
		],
		other: [
			{
				name: "weird",
				desc: [
					"What the fuck is wrong with you?",
					function(args,term,g){
						term.clear()
						term.print("okay, you're getting started over.")
						g.room = rooms["room_1"]
					}
				],
			},
		],
	},

	"saved_girl" : {
		desc: [
			"You're at the cliff base. The girl that you saved is standing before you.",
			"There's a path leading up the cliff.",
		] ,
		objs: [
			{
				name: ["girl", "her"],
				desc: [
					"She looks a bit shaken up but overall, alive.",
					"Her hair is blowing slightly in the breeze.",
					"To be honest, she's kind of ugly.",
				],
			},
			{
				name: ["back", "backwards", "before"],
				move: [
					function(args,term,g){
						g.room = rooms["room_cliff"]
						g.room.setup(term,g)
						g.room.vars.fallingRate = 8
						g.room.vars.secondTime = true
						term.clear()
					}
				]
			},
			{
				name: ["up", "cliff"],
				move: [
					function(args,term,g){
						g.room = rooms["climb_cliff"]
						g.room.setup(term,g)
					}
				]
			},
		],
		cmds: [
			{
				name: ["rip", "oops", "shit", "fuck", "damn"],
				cmd: function(args,term,g){
					term.print("indeed.")
				},
			},
			{
				name: "talk",
				cmd: function(args,term,g){
					term.print("^thanks, b.^")
				}
			},
			weirdCmd,
		],
		other: [
			{
				name: "weird",
				desc: [
					"What the fuck is wrong with you?",
					function(args,term,g){
						term.clear()
						term.print("okay, you're getting started over.")
						g.room = rooms["room_1"]
					}
				],
			},
		],
	},

	"killed_girl_twice" : {
		setup: function(term,g){
			term.print("wow, you just killed the same girl twice.")
		},
		desc: [
			"you're a fucking killer. *go up* the damn cliff.",
		] ,
		objs: [
			{
				name: ["girl", "her"],
				desc: [
					"She's really very surely dead this time.",
					"You sure got her. Good Job.",
				],
			},
			{
				name: ["back", "backwards", "before"],
				move: [
					"Why, so you can kill her a third time?",
					"No."
				],
			},
			{
				name: ["up", "cliff"],
				move: [
					function(args,term,g){
						g.room = rooms["climb_cliff"]
						g.room.setup(term,g)
					}
				]
			},
		],
		cmds: [
			{
				name: ["rip", "oops", "shit", "fuck"],
				cmd: function(args,term,g){
					term.print("indeed.")
				},
			},
			{
				name: "talk",
				cmd: function(args,term,g){
					term.print("The fuck do you think will happen?")
				}
			},
			weirdCmd,
		],
		other: [
			{
				name: "weird",
				desc: [
					"What the fuck is wrong with you?",
					function(args,term,g){
						term.clear()
						term.print("okay, you're getting started over.")
						g.room = rooms["room_1"]
					}
				],
			},
		],
	},

	"climb_cliff": {
		setup: function(term,g){
			term.blink = false;
			term.print("You Start up the hill.")

			g.room.vars.fallingTimer = g.room.vars.fallingTimer1
			g.room.vars.distanceClimbed = 0

			setTimeout(function(){
				if(g.room.vars.distanceClimbed === 0)
					term.print("*Ahem* ... You Start up the hill!")
			}, 4000)
			term.input = "|" + " ".repeat(g.room.vars.cliffHeight) + "|"

			term.keyPressedControlOverride = function(keyCode,term,g){

				if (keyCode == "Enter" || keyCode == "Backspace") return true
				if (keyCode == 116) return false
				g.room.vars.distanceClimbed+= 1
				term.input = "|" + "*".repeat(g.room.vars.distanceClimbed) + " ".repeat(g.room.vars.cliffHeight - g.room.vars.distanceClimbed) + "|"
				
				//33%
				if(g.room.vars.distanceClimbed >= g.room.vars.cliffHeight/3 && g.room.vars.fallingTimer > g.room.vars.fallingTimer2){
					term.print("The grade of the hill steepens")
					g.room.vars.fallingTimer = g.room.vars.fallingTimer2
				}
				//66%
				if(g.room.vars.distanceClimbed >= g.room.vars.cliffHeight*2/3 && g.room.vars.fallingTimer > g.room.vars.fallingTimer3){
					term.print("The hill gets even steeper. You can hear someone snoring.")
					g.room.vars.fallingTimer = g.room.vars.fallingTimer3
				}

				if(g.room.vars.distanceClimbed >= g.room.vars.cliffHeight){
					g.room = rooms["cliff_top"]
					g.room.setup(term,g)
				}

				return true;
			}
			decayFunction = function(){
				if(g.room.vars.climbingCliff){
					if(g.room.vars.distanceClimbed > 0)
						g.room.vars.distanceClimbed--
						term.input = "|" + "*".repeat(g.room.vars.distanceClimbed) + " ".repeat(g.room.vars.cliffHeight - g.room.vars.distanceClimbed) + "|"
					setTimeout(decayFunction, g.room.vars.fallingTimer)
				}
			}
			decayFunction()
		},
		vars: {
			fallingTimer: 400,
			fallingTimer1: 400,
			fallingTimer2: 150,
			fallingTimer3: 40,
			distanceClimbed: 0,
			cliffHeight:50,
			climbingCliff: true,
		},

	},

	"cliff_top": {
		setup: function(term,g){
			term.blink = true;
			term.clear()
			term.keyPressedControlOverride = null;
			term.print("You reach the top.")
			setTimeout(function(){
				console.log(term.input.length)
				if(term.input.length > 3){
					g.room.vars.playerText = term.input
					setTimeout(function(){
						term.print("A large figure stirrs.")
						setTimeout(function(){
							term.print("^Did somebody say ^" + g.room.vars.playerText + "^?^")
								setTimeout(function(){
								term.print("The figure picks you up and throws you off of the cliff")
								term.print("like the wimpy piece of shit that you are.")
								setTimeout(function(){
									g.room = rooms["cliff_base"]
									g.room.setup(term,g)
								}, 3600)

							},2500)
							//the figure throws you off of the cliff
							//wait, cls
							//plop
							//either dead girl or alive girl, reactionary to getting thrown off

						},1700)
					}, 1000)
				}
			}, 500)

		},
		vars: {
			climbingCliff: false,
			playerText: ""
		},
		desc: [
			"You're at the top of a cliff. A large figure is sleeping next to a fire.",
		],
		objs: [
			{
				name: ["figure", "person", "man", "him", "them", "her"],
				desc: ["It looks like a man with a big long santa beard"],
			},
		],
		cmds: [
			{
				name: ["attack", "punch", "throw", "push", "fight"],
				cmd: function(args, term, g){
					term.print("You approach the figure with malice in your heart.")
					g.room.other.interaction(term,g)
				},
			},
			{
				name: ["talk", "yell", "say"],
				cmd: function(args, term, g){
					term.print("Your words startle the figure awake.")
					g.room.other.interaction(term,g)
				}
			},
		],
		other: {

			interaction: function(term,g){
				
				setTimeout(function(){
					term.print("^What Do you want?^")
					setTimeout(function(){
						term.print("^Do you want to kill me like you killed that girl?^")
						setTimeout(function(){
							term.print("^I won't let you.^")
							term.allowTyping = false
							setTimeout(function(){
								term.clear()
								term.print("*The End.*")
							},6000)
						}, 1500)
					}, 1500)
				}, 2000)
			},
		},

	},
	"cliff_base": {
		setup: function(term,g){
			term.clear()
			setTimeout(function(){
					term.print("^plop.^")		
			}, 400)
		
		},
		desc: [
			"You're at the bottom of the cliff again. You landed on the girl",
			"The path leading up the cliff is looking at you mockingly.",
		] ,
		objs: [
			{
				name: ["girl", "her"],
				desc: [
					"She's very flat and very, very dead.",
				],
			},
			{
				name: ["up", "cliff"],
				move: [
					function(args,term,g){
						g.room = rooms["climb_cliff"]
						g.room.setup(term,g)
					}
				]
			},
		],
		cmds: [
			{
				name: ["rip", "oops", "shit", "fuck"],
				cmd: function(args,term,g){
					term.print("indeed.")
				},
			},
			weirdCmd,
		],
		other: [
			{
				name: "weird",
				desc: [
					"What the fuck is wrong with you?",
					function(args,term,g){
						term.clear()
						term.print("okay, you're getting started over.")
						g.room = rooms["room_1"]
					}
				],
			},
		],
	},
}

//preload images
var girl_falling_img = new Image()
girl_falling_img.src = loadImage('game/sprites/girl_falling_lg.png')

// I don't like having this level of vulgarity in my codebase, but it needs to be done.
// This is if you make weird comments about the girl.

weirdCmd = {
	name: ["lick", "touch", "grab", "rape", "like", "smell", "sniff", "rub", "attack", "grope", "fuck", "diddle", "kiss", "moisten", "tickle", "romp"],
	cmd: function(args, term, g){
		if(args[0] === "girl" || args[0] === "her" || args[1] === "girl"){
			var res = JSONFinder(g.room.other, "weird", "desc")
			
			if(typeof(res) === "function"){
				res(args,term,g)
			}
			else{
				term.print(res)
			}
		}
	}
}

