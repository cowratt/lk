rooms = {
	"room_1": {
		desc: [
		"You're in a room.",
		"You're still in a room.",
		[
		{ text: 'Why don\'t you ' },
  		{ text: 'leave', fillStyle: 'red' },
  		{ text: ' the room?' },],
		],
		tries:0,
		cmds: [
			{
				name: "leave",
				help: "",
				cmd: function (args, term, g){
					term.print(".")
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
						if(diff > 8950){
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
					}, 9000);	
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
			g.room.vars.overrideString = "no I don't"
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
				if(keyCode == BACKSPACE) g.room.vars.stringPos = max(g.room.vars.stringPos - 1, 0)
				if(keyCode == ENTER){
					console.log(g.room.vars.actualInput)
					g.room.vars.stringPos = 0
					if(g.room.vars.actualInput === g.room.vars.overrideString){
						term.print("yep")
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
		],
		tries:0,
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
				desc: "it's a cliff."
			},
			{
				name: ["rocks", "rock"],
				desc: "Why the fuck would you look at rocks?"
			},
			{
				name: ["girl"],
				desc: function(args,term,g){
					console.log("play animation")
					return ""
				}
			}
		],
		vars :[

		],
	},
}