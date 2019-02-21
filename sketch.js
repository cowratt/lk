
var term
function setup() {
	var cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('display', 'block');
	term = new terminal(width,height)

	myFont = loadFont('november.ttf');
	textFont(myFont);
}

function draw() {
	background(0)

	term.draw()
}

function keyTyped(){
	console.log(key)
	term.input = [term.input.slice(0, term.cursorPos), key, term.input.slice(term.cursorPos)].join('');
	term.cursorPos += 1
}

function keyPressed(){
	term.blinkState = 0
	console.log(keyCode)
	if(keyCode == LEFT_ARROW) term.cursorPos = max(0,term.cursorPos - 1)
	if(keyCode == RIGHT_ARROW) term.cursorPos = min(term.input.length,term.cursorPos + 1)
	if(keyCode == BACKSPACE){
		if(term.cursorPos != 0){
			term.input = [term.input.slice(0, term.cursorPos - 1), term.input.slice(term.cursorPos)].join('');
			term.cursorPos -= 1
		}
		else
			term.flash()
	}
	if (keyCode == ENTER){
		term.submit()
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
		this.cursorPos = 0
		this.lines = ["Hello"]
		this.input = ""
		this.resize(height, width)
	}
	resize(height, width){
		this.height = height
		this.width = width
		this.numLines = height / (this.lineHeight + this.lineSpacing)

	}
	flash(){
		console.log("flash term")
	}
	submit(){
		this.lines.unshift(this.input)
		this.input = ""
		this.cursorPos = 0
	}
	draw(){
		//draw text
		textSize(32);
		fill(0, 102, 153);
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

		//draw prev lines
		for (var i = 0; i < this.lines.length; i++){
			text(this.lines[i],20,height - this.lineHeight*(i+3))
		}
	}
}