var g

var canvas
var term
function setup() {
	var cnv = createCanvas(windowWidth, windowHeight);
  	cnv.style('display', 'block');


  	canvas = document.getElementById("defaultCanvas0").getContext("2d")
	

	term = new terminal(width,height)
	g = new game()
	//frameRate(30)
	
	//draw text
	textSize(32);
	myFont = loadFont('november.ttf');
	textFont(myFont);

	setTimeout(function() {canvas.font = "32px november"}, 10);
}
var totalTime = 0
function draw() {
	term.draw()


}

function keyTyped(){

	if ([13].includes(keyCode)) return
	if(term.keyTypedControlOverride != null){
		var rt = term.keyTypedControlOverride(key, term, g)
		if(rt) return false
	}
	term.input = [term.input.slice(0, term.cursorPos), key, term.input.slice(term.cursorPos)].join('');
	term.cursorPos += 1
	return false
}

function keyPressed(){
	if(term.keyPressedControlOverride != null){
		var rt = term.keyPressedControlOverride(keyCode, term, g)
		if(rt) return
	}
	console.log(keyCode)
	term.blinkState = 0
	if(keyCode == LEFT_ARROW) term.cursorPos = max(0,term.cursorPos - 1)
	if(keyCode == RIGHT_ARROW) term.cursorPos = min(term.input.length,term.cursorPos + 1)
	if(keyCode == BACKSPACE){
		if(term.cursorPos != 0){
			term.input = [term.input.slice(0, term.cursorPos - 1), term.input.slice(term.cursorPos)].join('');
			term.cursorPos -= 1
		}
		else
			term.flash()
		return false
	}
	if (keyCode == DELETE){
		if(term.cursorPos < term.input.length){
			term.input = [term.input.slice(0, term.cursorPos), term.input.slice(term.cursorPos + 1)].join('');
		}
		else{
			term.flash()
		}
	}
	if (keyCode == ENTER){
		term.submit()
	}
	if (keyCode == TAB){
		return false
	}

}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

class terminal {

	constructor(height, width) {
		this.lineHeight = 35
		this.lineSpacing = 5
		this.blinkRate = 60
		this.blinkState = 0

		this.flashState = 0

		this.cursorPos = 0
		this.lines = []
		this.input = ""
		this.newInput = false

		this.resize(height, width)

		this.callback = null

		this.keyTypedControlOverride = null
		this.keyPressedControlOverride = null
		this.print("Welcome to lk.")

	}
	resize(height, width){
		this.height = height
		this.width = width
		this.numLines = height / (this.lineHeight + this.lineSpacing)

	}
	flash(){
		console.log("flash term")
		this.flashState = 6
	}
	clear(){
		this.lines = []
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
		this.lines[0] = text
	}

	submit(){
		if(this.input.match(/^\s*$/)){
			this.flash()
			this.input = ""
			this.cursorPos = 0
			return
		}

		this.lines.unshift(this.input)
		this.input = ""
		this.cursorPos = 0
		this.newInput = true

		g.processCmd(this.lines[0], this)
	}
	getInput(){
		while(this.newInput == false){

		}
		this.newInput = false
		return this.lines[0]
	}
	draw(){
		background(0)
		if(this.flashState > 0){
			this.flashState--
			background(30)
		}

		fill(60, 102, 200);


		text("> " + this.input,20,height - this.lineHeight)
		//draw blink
		this.blinkState++
		if (this.blinkState > this.blinkRate) this.blinkState = 0
		if(this.blinkState < this.blinkRate /2){
			//calc cursor pos
			var keyWidth = 16
			var cursorOffset = this.cursorPos * keyWidth + 47
			text("|",cursorOffset,height - this.lineHeight)
		}

		//draw prev lines using a totally different shader method because why the fuck not
		for (var i = 0; i < this.lines.length; i++){

			//text(this.lines[i],20,height - this.lineHeight*(i+3))
			
			if(typeof(this.lines[i]) !== 'string'){
				fillMixedText(canvas, this.lines[i], 20,height - this.lineHeight*(i+3))
			}
			else{
				canvas.fillText(this.lines[i],20,height - this.lineHeight*(i+3))
			}
			
		}
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