class game{

	constructor(){
		this.room = rooms["room_1"]
		this.player = {
			name: "",
		}
		this.cmds = [
			{
				name: ["lk", "look"],
				help: "look around",
				cmd: function (args, term, g){
					var desc = g.room.desc[min(g.room.desc.length - 1, g.room.tries)]
					g.room.tries++

					if(desc == null) desc = ""
					term.print(desc)
				},
			},
			{
				name: "help",
				help: "nobody's coming...",
				cmd: function (args, term, g){
					console.log(args)
					if (args.length === 0)
						term.print("Type 'help' for help. What's this game called?")
					else{
						//TODO impliment specific help
					}
				},
			},
			{
				name: "cls",
				help: "clear console",
				cmd: function (args, term, g){
					term.lines = []
				},
			},
		]
		
	}
	processCmd(command, term){
		console.log("Process Cmd: " + command)
		
		//process args and validate
		var args = command.split(' ')
		command = args[0]
		if(args.length > 1){
			args = args.slice(1, args.length)
		}
		else args = []

		var allCmds = this.room.cmds.concat(this.cmds)

		//look for * wildcard first
		for(var i = 0; i < allCmds.length; i++){
			if(allCmds[i].name === "*"){
				var rt = allCmds[i].cmd(args,term,this)
				if(rt) return
			}
		}

		for(var i = 0; i < allCmds.length; i++){
			var cmd = allCmds[i]
			//check for synonym commands
			var syns = cmd.name
			if (!Array.isArray(cmd.name)){
				syns = [cmd.name]
			}

			for (var j = 0; j < syns.length; j++){
				if (syns[j] === command){
					cmd.cmd(args, term, this)
					return
				}
			}
			
		}
	}
}

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
						if(diff > 8000){
							term.print(" ")
							term.print("wow, you must REALLY be stumped.")
							setTimeout(function() {
								term.print("why don't you just *leave* the room again?")
								g.room = rooms["room_3"]
							}, 2000);
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
			{
				name: ["why", "what", "how"],
				help: "",
				cmd: function (args, term, g){
					term.print("because I said so")				
				},
			},
		],
		vars :[

		],
	},
	"room_3": {
		desc: [
		"Yep, it's definitely a different room",
		],
		tries:0,
		cmds: [
			{
				name: "leave",
				help: "",
				cmd: function (args, term, g){
					term.print("Haha Goteem.")					
				},
			},
		]
	},
}