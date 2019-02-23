class game{

	constructor(){
		this.room = rooms["room_4"]
		this.player = {
			name: "",
		}
		this.cmds = [
			{
				name: ["lk", "look"],
				help: "look around",
				cmd: function (args, term, g){
					var desc
					var stopwords = ["at", "in"]
					// "lk"
					if(args.length === 0){
						desc = g.room.desc[min(g.room.desc.length - 1, g.room.tries)]
						g.room.tries++
					}
					//"look at rock" / "lk rock"
					else{
						var selectedArg = 0
						while(selectedArg < args.length && desc == null){
							for (var i = 0; i < g.room.objs.length; i++){
								var obj = g.room.objs[i]
								//check for synonym commands
								var syns = obj.name
								if (!Array.isArray(obj.name)){
									syns = [obj.name]
								}
								console.log(syns.length)
								for (var j = 0; j < syns.length; j++){
									console.log(syns[j], args[selectedArg])
									if (syns[j] === args[selectedArg]){
										
										desc = obj.desc
									}
								}
							}
						
							selectedArg++
						}
					}
					
					if(typeof(desc) === "function") desc = desc([],term,g)
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
