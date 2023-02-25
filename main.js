
var canvas = null
var ctx = null

const defaultStyle = {
	font: '15px "Oxygen Mono"',
	padding: 15,
	boxRadius: 15 / 4,
	boxBackground: '#fff',
	boxOutline: '#000',
}






let style = defaultStyle

function roundRect(ctx, x, y, width, height, radius) {
	if (typeof radius === 'number') {
		radius = { tl: radius, tr: radius, br: radius, bl: radius }
	}

	ctx.beginPath()
	ctx.moveTo(x + radius.tl, y)
	ctx.lineTo(x + width - radius.tr, y)
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
	ctx.lineTo(x + width, y + height+ - radius.br)
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
	ctx.lineTo(x + radius.bl, y + height)
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
	ctx.lineTo(x, y + radius.tl)
	ctx.quadraticCurveTo(x, y, x + radius.tl, y)
	ctx.closePath()
}

/**
 * @class
 */
class Box {
	/**
	 * @constructor
	 * @param {string} name - Отображаемое имя ноды
	 * @param {string|Object[]} inputs 
	 * @param {string|Object[]} outputs 
	 */
	constructor(name, inputs, outputs) {
		this.name = name
		this.inputs = this.parse(name, inputs)
		this.outputs = this.parse(name, outputs)
		ctx.font = style.font
		this.width = ctx.measureText(this.name).width + style.padding * 2
		this.height = this.inputs.length > this.outputs.length ? this.inputs.length : this.outputs.length
		this.height = this.height > 2 ? this.height : 2
		this.height *= style.padding

		this.position = { x: 0, y: 0 }
		this.move(Math.random() * canvas.width, Math.random() * canvas.height)
	}

	/**
	 * 
	 * @param {float} x 
	 * @param {float} y 
	 */
	move(x, y) {
		this.position.x = x
		this.position.y = y

		for (let i in this.inputs) {
			const input = this.inputs[i]
			input.position.x = this.position.x - this.width / 2.0
			input.position.y = style.padding * i - style.padding / 2 * this.inputs.length + this.position.y + style.padding / 2
		}

		for (let i in this.outputs) {
			const output = this.outputs[i]
			output.position.x = this.position.x + this.width / 2.0
			output.position.y = style.padding * i - style.padding / 2 * this.outputs.length + this.position.y + style.padding / 2
		}
	}

	/**
	 * 
	 * @param {string} name 
	 * @param {string} type 
	 * @param {float} x 
	 * @param {float} y 
	 * @param {Object} connection 
	 * @returns {Object}
	 */
	newConnector(name, type,value, x = 0, y = 0, connection = null) {
		return {
			name: name,
			type: type,
			value: value,
			position: { x: x, y: y },
			// connection: connection
		}
	}

	/**
	 * 
	 * @param {Object} name 
	 * @param {string} data 
	 * @returns {Array}
	 */
	parse(name, data) {
		if (data) {
			if (typeof data === 'string') {
				return [this.newConnector(name, data, null)]
			}
			if (typeof data === 'object') {
				if (data.constructor === Array) {
					return data.filter(v => 'name' in v && 'type' in v && 'value' in v).map(v => this.newConnector(v.name, v.type, v.value))
				}
				else {
					if ('name' in data && 'type' in data && 'value' in v) {
						return [this.newConnector(data.name, data.type, data.value)]
					}
				}
			}
		}

		return []
	}

	collision(x, y) {
		if (x >= this.position.x - this.width / 2 - style.padding / 2 && x <= this.position.x + this.width / 2 + style.padding / 2 &&
			y >= this.position.y - this.height / 2 && y <= this.position.y + this.height / 2) {

			for (let i in this.inputs) {
				const input = this.inputs[i]
				const tx = this.position.x - this.width / 2.0
				const dx = x - tx
				const ty = style.padding * i - style.padding / 2 * this.inputs.length + this.position.y + style.padding / 2
				const dy = y - ty

				if (Math.sqrt(dx * dx + dy * dy) <= style.padding / 2) {
					// console.log('input: ' + input.name)
					return input
				}
			}

			for (let i in this.outputs) {
				const output = this.outputs[i]
				const tx = this.position.x + this.width / 2.0
				const dx = x - tx
				const ty = style.padding * i - style.padding / 2 * this.outputs.length + this.position.y + style.padding / 2
				const dy = y - ty

				if (Math.sqrt(dx * dx + dy * dy) <= style.padding / 2) {
					// console.log('output: ' + output.name)
					return output
				}
			}

			if (x >= this.position.x - this.width / 2 && x <= this.position.x + this.width / 2)
			{
				// console.log('box: ' + this.name)
				return this
			}
		}

		return null
	}

	/**
	 * 
	 */
	draw() {
		ctx.fillStyle = '#fff'
		//ctx.rect(this.position.x - this.width / 2.0, this.position.y - this.height / 2.0, this.width, this.height)
		roundRect(ctx, this.position.x - this.width / 2.0, this.position.y - this.height / 2.0, this.width, this.height, style.boxRadius)
		ctx.fillStyle = style.boxBackground
		ctx.strokeStyle = style.boxOutline
		ctx.stroke()
		ctx.fill()

		ctx.font = style.font
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.fillStyle = '#000'
		ctx.fillText(this.name, this.position.x, this.position.y)

		const y = this.position.y
		const h = this.height
		ctx.fillStyle = '#fff'

		for (let i in this.inputs) {
			const input = this.inputs[i]
			const l = this.inputs.length

			ctx.beginPath()
			ctx.arc(this.position.x - this.width / 2.0, style.padding * i - style.padding / 2 * l + y + style.padding / 2, style.padding * 2.0 / 8.0, 0.0, 2.0 * Math.PI)

			ctx.strokeStyle = '#000'

			if (input.connection) {
				ctx.fillStyle = '#000'
				ctx.fill()

				ctx.beginPath()
				ctx.moveTo(input.position.x, input.position.y)
				let cp1 = {
					x: input.position.x - Math.abs(input.position.x - input.connection.position.x)/2,
					y: input.position.y
				}
				let cp2 = {
					x: input.connection.position.x + Math.abs(input.position.x - input.connection.position.x)/2,
					y: input.connection.position.y
				}
				// ctx.fillRect(cp2.x, cp2.y, 5,5)
				// ctx.fillStyle = "#0f0"
				// ctx.fillRect(cp1.x, cp1.y, 5,5)
				// ctx.fillStyle = "#f00"
				ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, input.connection.position.x, input.connection.position.y)
				ctx.stroke()
			}
			else {
				ctx.stroke()
				ctx.fillStyle = '#fff'
				ctx.fill()
			}
		}

		for (let i in this.outputs) {
			const output = this.outputs[i]
			const l = this.outputs.length

			ctx.beginPath()
			ctx.arc(this.position.x + this.width / 2.0, style.padding * i - style.padding / 2 * l + y + style.padding / 2, style.padding * 2.0 / 8.0, 0.0, 2.0 * Math.PI)

			if (output.connection) {
				ctx.fillStyle = '#000'
				ctx.fill()
			}
			else {
				ctx.strokeStyle = '#000'
				ctx.fillStyle = '#fff'
				ctx.stroke()
				ctx.fill()
			}
		}
	}

	run(showcl = false){
		if (showcl) console.log(this.name)
	}
}

/**
 * @class
 */
class Addition extends Box {

	/**
	 * 
	 * @param  {...any} args 
	 */
	constructor(...args) {
		super(...args)
	}

	/**
	 * @description Суммирует входы
	 */
	sum(){
		let sum = 0;

		try {
			this.inputs.forEach(element => {
				if (element.connection)
				sum += element.connection.value
			});
	
			this.outputs[0].value = sum;
		} catch (error) {
			// console.error(error);
		}
		
	}
	run(){
		this.sum()
	}
}
/**
 * @class
 */
class Print extends Box {

	/**
	 * 
	 * @param  {...any} args 
	 */
	constructor(...args) {
		super(...args)
	}

	/**
	 * @description Суммирует входы
	 */
	print(){
		try {
			console.log(this.name, "output: ", this.inputs[0].connection.value)
		} catch (error) {
			// console.error(error)
		}
	}


	run(){
		this.print()
	}
}

let boxes = []
window.onload = () => {
	canvas = document.createElement('canvas')
	canvas.style.position = 'fixed'
	canvas.style.top = 0
	canvas.style.right = 0
	canvas.style.bottom = 0
	canvas.style.left = 0
	canvas.style.width = '100%'
	canvas.style.height = '100%'

	const cursorState = {
		dragging: null,
		connecting: null,
		currentTarget: null,
	}

	canvas.onmousemove = event => {
		if (cursorState.dragging) {
			cursorState.dragging.move(event.offsetX, event.offsetY)
			draw()
			return
		}

		cursorState.currentTarget = null

		for (let i in boxes) {
			const box = boxes[i]
			const collision = box.collision(event.offsetX, event.offsetY)

			if (collision) {
				cursorState.currentTarget = collision
				canvas.style.cursor = 'grab'
				break
			}
		}
	}

	canvas.onmousedown = event => {
		if (cursorState.currentTarget) {
			if (cursorState.currentTarget.constructor === Box || cursorState.currentTarget.constructor === Print || cursorState.currentTarget.constructor === Addition) {
				cursorState.dragging = cursorState.currentTarget
				canvas.style.cursor = 'grabbing'
			}
			else {
				cursorState.connecting = cursorState.currentTarget
				// console.log('connecting: ', cursorState.currentTarget.name)
			}
		}
	}

	canvas.onmouseup = event => {
		if (cursorState.dragging) {
			cursorState.currentTarget = cursorState.dragging
			cursorState.dragging = null
		}

		if (cursorState.connecting) {
			if (cursorState.connecting.name !== cursorState.currentTarget.name){
				if (cursorState.currentTarget.constructor !== Box || cursorState.currentTarget.constructor !== Addition) {
					cursorState.connecting.connection = cursorState.currentTarget
					cursorState.currentTarget.connection = cursorState.connecting
					// console.log('connected')
				}
				
			}
			cursorState.connecting = null

			draw()
		}

		if (cursorState.currentTarget) {
			canvas.style.cursor = 'grab'
		}
		else {
			canvas.style.cursor = 'default'
		}
	}

	canvas.ondblclick = event => {
		
		if (cursorState.currentTarget.connection){
			cursorState.currentTarget.connection = null
		}
		
	}

	document.body.appendChild(canvas)

	canvas.width = canvas.offsetWidth
	canvas.height = canvas.offsetHeight
	ctx = canvas.getContext('2d')

	

	boxes.push(new Addition('Addition', 
	[
		{
			name: 'Add_i_a',
			type: 'float',
			value: null,
		}, 
		{
			name: 'Add_i_b',
			type: 'float',
			value: null,
		},
	], [
		{
			name: 'Add_o_a',
			type: 'float',
			value: null,
		}, 
]))
	
	boxes.push(new Box('1', null, [{name:'Var1_o_a',type: 'float', value: 1}]))
	boxes.push(new Box('2', null, [{name:'var2_o_a', type: 'float', value: 2}]))
	boxes.push(new Print('Print', 'float', null))

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		for (let i in boxes) {
			const box = boxes[i]
			box.run()
			box.draw()
		}
	}

	draw()

	let f = new FontFace('Oxygen Mono', 'url(https://fonts.googleapis.com/css?family=Oxygen+Mono)')
	f.load().then(function() {
		draw()
	})


	
	
}

