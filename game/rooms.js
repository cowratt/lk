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
					term.print(". ")
					setTimeout(function (){
						term.update("..")
						setTimeout(function (){
							term.update("...")
							setTimeout(function (){
								term.print("Just Kidding, You can't leave this room.")
								g.room.cmds.unshift({
									name: "*",
									help: "",
									cmd: function (args, term, g){
										term.print("I'm just fucking around! Look around, you're already in a different room!")
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
				name: "_",
				help: "",
				cmd: function(args,term,g){
					term.print("That command is way too advanced.")
				}
			}
		]
	},
	"room_2": {
		desc: [
		"Yep, it's definitely a different room",
		"You think I'd give you another hint in the same way? Bad design!!",
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
							term.print(" ")
							term.print("wow, you must REALLY be stumped.")
							setTimeout(function() {
								term.print("This is my game.")
								setTimeout(function() {
									term.print("Do you think that you have any control?")
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
				if(keyCode == BACKSPACE){
					g.room.vars.stringPos = max(g.room.vars.stringPos - 1, 0)
					g.room.vars.actualInput = g.room.vars.actualInput.slice(0,g.room.vars.actualInput.length - 1)
				} 
				if(keyCode == ENTER){
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
		"There are also some rocks on the ground."
		],

		cmds: [
			{
				//let's try a timeout function
				name: "*",
				help: "",
				cmd: function (args, term, g){
				},
			},
		],
		objs:[
			{
				name: "cliff",
				desc: [
				"it's a cliff. Is that a girl up there?",
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
			g.room.vars.girlX = 200
			g.room.vars.save = false
			g.room.vars.drawBG = false
			g.room.vars.opac = 0
			term.drawOverride = g.room.draw

		},
		draw: function(term,g){
			if(g.room.vars.drawBG){
				g.room.vars.opac+= 1
				tint(255, g.room.vars.opac)
				image(saveGirlBG[round(g.room.vars.opac / 20) % 3], 0, 0)
				tint(255,255)
			}

			image(girl, g.room.vars.girlX, g.room.vars.girlY)
			if(!g.room.vars.save){
				
				g.room.vars.girlY += 4.5
				if(canvas.measureText(term.input).width > g.room.vars.girlX && g.room.vars.girlY > (height - 140)){
					g.room.vars.save = true
					girl = girl_resting
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
								term.print("   ")
								setTimeout(function() {
									term.update("^Thank you,^ " + term.input + ".")
									term.print("   ")
								}, 3000);
							}, 3500);
						}, 3000);
					}, 1500);
					
				}
			}

			


			return false
		},
	},
}