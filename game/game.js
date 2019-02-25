class game{

	constructor(){
		this.room = rooms["room_4"]
		this.player = {
			name: "",
			inventory: [],
		}
		this.cmds = [
			{
				name: ["lk", "look", "examine"],
				help: "look around",
				cmd: function (args, term, g){
					var desc
					var stopwords = ["at", "in"]
					var generics = ["around", "room"]
					// "lk"
					if(args.length === 0 || generics.includes(args[0])){
						if(g.room.tries == null) g.room.tries = 0
						if(Array.isArray(g.room.desc)){
							desc = g.room.desc[min(g.room.desc.length - 1, g.room.tries)]
							g.room.tries++
						}
						else{
							desc = g.room.desc
						}
						
					}
					//"look at rock" / "lk rock"
					else{
						var selectedArg = 0
						while(selectedArg < args.length && desc == null){
							desc = JSONFinder(g.room.objs, args[selectedArg], "desc")
							if(desc === null)desc = JSONFinder(g.player.inventory, args[selectedArg], "desc")
							selectedArg++
						}
					}
					console.log(desc)
					
					if(typeof(desc) === "function") desc = desc([],term,g)
					if(desc == null) desc = ""

					term.print(desc)
				},
			},
			{
				name: ["inventory", "inv", "items", "i"],
				help: "what you've got",
				cmd: function(args,term,g){
					if(g.player.inventory.length != 0){
						var items = "You have " + g.player.inventory[0].title
						for(var i = 1; i < g.player.inventory.length; i++){
							items = items + ", " + g.player.inventory[i]
						}
						term.print(items + ".")
					}
					else{
						term.print("Y'AINT GOT SHIT!")
					}
				}

			},
			{
				name: "help",
				help: "nobody's coming...",
				cmd: function (args, term, g){
					console.log(args)
					term.print("Type 'help' for help. What's this game called?")
					if (args.length === 0){
						//TODO
					}
					else{
						//TODO impliment specific help
					}
				},
			},
			{
				name: "cls",
				help: "clear console",
				cmd: function (args, term, g){
					term.clear()
				},
			},
			{
				name: "echo",
				cmd: function(args, term, g){
					term.print(args.join(" "))
				}
			}
		]
		
	}
	processCmd(command, term){
		console.log("Process Cmd: " + command)
		
		command = command.toLowerCase()

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
	addToInventory(item,term){
		if(this.player.inventory.length === 0){
			//this.player.inventory = []
			term.print("Oh, by the way.. You can list your items with *inventory* or *i*")
		}
		this.player.inventory.push(item)
	}
}


//Everything is stored in json objects with the key in the object. I'm seriously reinventing the wheel here.
//keys are stored under "name", possibly in an array
//when the specified object is found, the whole thing is returned.
//order or operations: '*'  -> everything -> '_'
function JSONFinder(allObjects, name, key = null){

	//first we look for the * case
	for (var i = 0; i < allObjects.length; i++){
		var obj = allObjects[i]
		if(obj.name === "*"){
			if(key === null) return obj
			if(obj[key] !== null) return obj.key
		}
	}

	//Then the everything else
	for (var i = 0; i < allObjects.length; i++){
		var obj = allObjects[i]
		//check for synonym commands
		var syns = obj.name
		if (!Array.isArray(obj.name)){
			syns = [obj.name]
		}
		console.log(syns)
		for (var j = 0; j < syns.length; j++){
			if (syns[j] === name){
				
				if(key === null){
					return obj
				}
				if(Array.isArray(obj[key])){
					
					if(obj[key + "_tries"] == null) obj[key + "_tries"] = 0
					else obj[key + "_tries"]++
					var idx = min(obj[key].length - 1, obj[key + "_tries"])
					return obj[key][idx]
				}
				else{
					return obj[key]
				}
			}
		}
	}

	//then we look for the _ case
	for (var i = 0; i < allObjects.length; i++){
		var obj = allObjects[i]
		if(obj.name === "_"){
			if(key === null) return obj
			if(obj[key] !== null) return obj.key
		}
	}
}