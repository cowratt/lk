const min = Math.min
const max = Math.max

var g
var term
var cliff

setTimeout(setup, 50)



function setup() {
	
	/*
	girl = loadImage('game/sprites/girl_falling_lg.png')
	girl_resting = loadImage('game/sprites/girl_resting_lg2.png')
	saveGirlBG = [loadImage('game/sprites/bg1.jpg'), loadImage('game/sprites/bg2.jpg'), loadImage('game/sprites/bg3.jpg')]
	*/
	term = new terminal(900,600)
	// this is used to tie the input to the terminal object
	ignores=["'", "/", "Backspace"]
	addEventListener('keydown', function(event) {
		console.log(event.key)
		if(ignores.includes(event.key))
		event.preventDefault()
		term.keyPressed(event)
	}, false);
	window.onresize = function(event) {
		//console.log("RESIZE")
		//console.log(window.innerWidth, window.innerHeight)
		//this.term.resize(window.innerWidth, window.innerHeight);
	};
	g = new game()
}
var totalTime = 0


class terminal {

	constructor(width, height) {
		this.canvas = document.getElementById("mainCanvas")
		this.ctx = this.canvas.getContext('2d')
		this.resize(width, height)
		

		this.lineHeight = 35
		this.blinkRate = 2
		this.blinkState = 0
		this.blink = true
		this.flashState = 0

		this.cursorPos = 0
		this.lines = []
		this.lastCommands = []
		this.lastCommandsPos = -1
		this.input = ""

		this.allowTyping = true
		this.drawOverride = null
		this.keyTypedControlOverride = null
		this.keyPressedControlOverride = null

		this.framerate = 1000/2
		this.drawTimeout = 0

		this.print("Welcome to lk.")
		this.draw()

	}
	/*
	enableDrawLoop(){
		//less performance but more useful
		this._drawLoopEnabled = true
		this.draw()
	}

	disableDrawLoop(){
		//grants mad performance and super powers
		this._drawLoopEnabled = false
		this.draw()
	}
	*/
	
	keyTyped(event){
		if (!this.allowTyping) return
		//when a letter/character is typed. just add it to the input string.
		this.blinkState = 0
		console.log("keyTyped")
		if(this.keyTypedControlOverride != null){
			// if the override returns true, don't process the key
			var rt = this.keyTypedControlOverride(event.key, this, g)
			if(rt){
				this.draw()
				return
			}
		}
		this.input = [this.input.slice(0, this.cursorPos), event.key, this.input.slice(this.cursorPos)].join('');
		this.cursorPos += 1
		this.draw()
	}

	keyPressed(event){
		if(!this.allowTyping) return
		//console.log(event)
		//defer simple keypresses to the other function
		if(event.key.length == 1) return this.keyTyped(event)
		var keyCode = event.keyCode
		console.log("keyPressed")
		if(this.keyPressedControlOverride != null){
			console.log("KEYCODE", event.key)
			var rt = this.keyPressedControlOverride(event.key, this, g)
			// if the override returns true, don't process the key
			if(rt){
				this.draw()
				return
			}
		}
		console.log(keyCode)
		this.blinkState = 0

		if(event.key == "ArrowLeft") this.cursorPos = max(0,this.cursorPos - 1)
		else if(event.key == "ArrowRight") this.cursorPos = min(this.input.length,this.cursorPos + 1)

		else if(event.key == "ArrowUp"){
			console.log(this.lastCommandsPos, this.lastCommands.length)
			if(this.lastCommandsPos > this.lastCommands.length || this.lastCommands.length == 0){
				this.flash()
			}
			else{
				this.lastCommandsPos = min(this.lastCommandsPos + 1, this.lastCommands.length - 1)
				this.input = this.lastCommands[this.lastCommandsPos ]
				this.cursorPos = this.input.length
			}
		}
		else if(event.key == "ArrowDown"){
			console.log(this.lastCommandsPos, this.lastCommands.length)
			if(this.lastCommandsPos == 0){
				if(this.input.length != 0) this.input = ""
				else this.flash()
			}
			else{
				this.lastCommandsPos -= 1
				this.input = this.lastCommands[this.lastCommandsPos]
				this.cursorPos = this.input.length
			}
		}
		else if(event.key == "Backspace"){
			
			if(this.cursorPos != 0){
				this.input = [this.input.slice(0, this.cursorPos - 1), this.input.slice(this.cursorPos)].join('');
				this.cursorPos -= 1
			}
			else this.flash()
		}
		else if (event.key == "Delete"){
			if(this.cursorPos < this.input.length){
				this.input = [this.input.slice(0, this.cursorPos), this.input.slice(this.cursorPos + 1)].join('');
			}
			else this.flash()
		}
		else if (event.key == "Enter"){
			this.submit()
		}
		else if (event.key == "Tab"){
			//something
		}
		this.draw()
	}




	resize(width, height){
		this.canvas.width = width
		this.canvas.height = height
		this.ctx.font = "32px november"

	}
	flash(){
		console.log("flash term")
		this.flashState = 1
		setTimeout(()=>{
			this.flashState = 0
			this.draw()}, 100)
	}
	clear(){
		this.lines = []
		this.cursorPos = 0
		this.input = ""
	}
	print(text){
		if(text === "") return
		/* this will convert text to rich/colored/italic text
		text = standard white console text
		*text* = red/highlighted text
		^text^ = green/other person text
		(text) = blue/player text
		_text_ = italic text
		*/

		//split lines at the newline character
		if (text.includes("\n")){
			text.split("\n").forEach((line)=>{
				this.print(line)
			})
			return
		}

		var checker = [
			{
				tag: "*",
				style: {
					fillStyle: 'red'
				},
				enabled: false,
			},
			{
				tag: "^",
				style: {
					fillStyle: 'green'
				},
				enabled: false,
			},
		]
		var last = 0
		var outputText = []
		for(var i = 0; i < text.length; i++){

			for(var j = 0; j < checker.length; j++){
				
				if(text[i] === checker[j].tag){

					var temp = {}
					temp.text = text.substring(last,i)
					last = i+1
					if(checker[j].enabled){
						temp = Object.assign(temp,checker[j].style)
					}
					checker[j].enabled = !checker[j].enabled
					outputText.push(temp)
				}
			}
		}
		if(last < text.length-1){
			var temp = {}
			temp.text = text.substring(last,text.length)
			outputText.push(temp)
		}
		console.log(outputText)
		this.lines.unshift(outputText)
	}
	//updates the last line
	update(text){
		this.lines = this.lines.slice(1,this.lines.length)
		this.print(text)
	}

	submit(){
		//push to last commands
		if(this.lastCommands[0] !== this.input){
			this.lastCommands.unshift(this.input)
		}
		console.log(this.lastCommands, this.lastCommandsPos)
		this.lastCommandsPos = -1
		if(this.input.match(/^\s*$/)){
			this.flash()
			this.input = ""
			this.cursorPos = 0
			return
		}

		this.lines.unshift(this.input)
		this.input = ""
		this.cursorPos = 0

		g.processCmd(this.lines[0], this)
	}
	background(lightness){
		if (typeof lightness === 'string' || lightness instanceof String){
			this.ctx.fillStyle = lightness
		}
		else{
			var colorString = 'rgb(' + (lightness + ", ").repeat(2) + lightness + ")"
			this.ctx.fillStyle = colorString
		}
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}
	draw(){
		clearTimeout(this.drawTimeout)
		if(this.drawOverride != null){
			var rt = this.drawOverride(this,g)
			if(rt) return
		}
		if(this.flashState > 0){
			this.background(60)
		}
		else {
			this.background("#000")
		}
		

		if(this.allowTyping){

			this.ctx.fillStyle = "rgb(60, 102, 200)"
			this.ctx.fillText(">" + this.input,20, this.canvas.height - this.lineHeight)
			//draw blink
			this.blinkState++
			if (this.blinkState > this.blinkRate) this.blinkState = 0
			if(this.blinkState < this.blinkRate /2 && this.blink){
				//calc cursor pos
				var keyWidth = 16
				var cursorOffset = this.cursorPos * keyWidth + 47
				this.ctx.fillText(" ".repeat(this.cursorPos + 1) + "|",15, this.canvas.height - this.lineHeight)
			}
		}


		//draw prev lines
		for (var i = 0; i < this.lines.length; i++){

			if(typeof(this.lines[i]) !== 'string'){
				fillMixedText(this.ctx, this.lines[i], 20, this.canvas.height - this.lineHeight*(i+2.5))
			}
			else{
				this.ctx.fillText(this.lines[i],20, this.canvas.height - this.lineHeight*(i+2.5))
			}
			
		}
		this.drawTimeout = setTimeout(()=>this.draw(), this.framerate)
	}
	drawImage(img, x, y){
		this.ctx.drawImage(img,x,y)

	}
}



const fillMixedText = (ctx, args, x, y) => {
  let defaultFillStyle = "gray";
  let defaultFont = ctx.font;

  ctx.save();
  args.forEach(({ text, fillStyle, font }) => {
    ctx.fillStyle = fillStyle || defaultFillStyle;
    ctx.font = font || defaultFont;
    ctx.fillText(text, x, y);
    x += ctx.measureText(text).width;
  });
  ctx.restore();
};

