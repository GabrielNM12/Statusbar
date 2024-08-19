const user_channel = "alanzoka";

var meta_follow = 1500000;
var meta_sub = 10;
var timer_rotativo = 3000000;

const cp$ = function(selector) {
	return new jQueryCopy(selector);
}

class jQueryCopy {
	constructor(selector) {
		
		this.elements = Array.from(document.querySelectorAll(selector));
		return this;
	}

	async addClass(classes) {

		return new Promise((endf)=>{

			if (classes.includes("hide")) {

				for (const elm of this.elements) {

					elm.style.opacity = 0;
				}
				setTimeout(()=>{

					for (const elm of this.elements) {

						elm.classList.add(classes);
					}
					endf()
				},250)
			}
			else {

				for (const elm of this.elements) {

					elm.classList.add(classes);
				}
				endf()
			}
		})
	}

	removeClass(classes) {

		return new Promise((endf)=>{

			if (classes.includes("hide")) {

				for (const elm of this.elements) {

					elm.style.opacity = 1;
				}
				setTimeout(()=>{

					for (const elm of this.elements) {

						elm.classList.remove(classes);
					}
					endf()
				},250)
			}
			else {

				for (const elm of this.elements) {

					elm.classList.remove(classes);
				}
				endf()
			}
		})
	}

	toggleClass(classes) {

		for (const elm of this.elements) {

			elm.classList.toggle(classes);
		}
	}

	get(index) {
		return this.elements[index];
	}
}

window.addEventListener("load", async function(event) {
	
	var controllerObserver = new MutationObserver((entries)=> {

		let vcontroller = entries[0].target;
		let controller_left = vcontroller.getBoundingClientRect().x

		let color = vcontroller.closest(".green") != null ? "green" : "blue";

		for (const rupee of cp$(`.${color} .rupee`).elements) {

			if(rupee.getBoundingClientRect().x <= controller_left) {
				rupee.classList.add("lit");
			}
			else {
				rupee.classList.remove("lit");
			}
		}
	})

	for (const vcontroller of cp$(".controller").elements) {
		
		controllerObserver.observe(vcontroller,{
			attributes: {
				x: true
			}
		});
	}

	window.current_mode = 0;
	window.mode_list = [set_red, set_green, set_blue, close_modes];

	window.modes_router = setInterval(async function(){

		const set_mode = mode_list[current_mode];
		await set_mode();
	},timer_rotativo);

	await set_red();
});

async function open_modes() {

	cp$(".main-container").removeClass("shrink");
}

async function close_modes() {

	current_mode = current_mode >= mode_list.length - 1 ? 0 : current_mode + 1;

	cp$(".main-container").addClass("shrink");
}

async function set_green() {

	current_mode = current_mode >= mode_list.length - 1 ? 0 : current_mode + 1;

	let data_follow = await fetch(`https://decapi.me/twitch/followcount/${user_channel}`);
	data_follow = await data_follow.json();

	let el_followcount = cp$("#followcount").get(0);

	el_followcount.innerHTML = `${data_follow}/${meta_follow}`;
	el_followcount.dataset.current = data_follow;
	el_followcount.dataset.target = meta_follow;

	let fill_percentage = (data_follow * 100 / meta_follow).toFixed(1);

	if (String(fill_percentage).split(".")[1] == "0") {
		fill_percentage = Math.floor(parseInt(fill_percentage))
	}

	cp$(".green .meta_concluida").removeClass("show");
	await cp$(".areaLabel,.areaContent,.mainBox .modeBox, .areaContent > .content").addClass("hide");
	await cp$(".areaLabel,.areaContent,.mainBox .modeBox.green, .areaContent > .content.green").removeClass("hide");

	await open_modes();

	cp$(".labelBox .modeBox").removeClass("selected");
	cp$(".labelBox .modeBox.green").addClass("selected");

	let controller = cp$(".content.green .controller").get(0);

	controller.dataset.value ??= 0
	if (controller.dataset.value == '0') {

		controller.parentElement.classList.add("initial_spawn");
	}

	await animate_controller(controller,parseFloat(fill_percentage), 1, 500);

	setTimeout(()=>{

		controller.parentElement.classList.remove("initial_spawn");
	},1000);

	if (fill_percentage >= 100) {
		await spin_green();
		complete_green();
	}

	let other_controller = cp$(".content.blue .controller").get(0);
	other_controller.style["left"] = "0%";
	other_controller.dataset.value = 0;
}

async function animate_controller(controller, target_value, step_value, time) {

	return new Promise((finish_animation)=>{

		controller.dataset.value ??= 0;
		let current_value = parseFloat(controller.dataset.value);
		let bigger = current_value < target_value;

		let time_delay = time / (Math.abs(target_value - current_value) / step_value);

		if (!bigger) {
			time_delay *= -1;
			step_value *= -1;
		}

		(function set_new_value(){

			setTimeout(()=>{

				controller.dataset.value = current_value = current_value + step_value;
				controller.style["left"] = current_value.clamp(0,93) + "%";
				controller.innerHTML     = current_value.clamp(0,999) + "%";

				if (bigger ? current_value >= target_value : current_value <= target_value) {

					finish_animation();
				}
				else {

					set_new_value();
				}
			},time_delay)
		})()
	});
}

async function spin_green() {

	let array_rupees = cp$(".green .rupee");
	array_rupees.removeClass("spin");
	array_rupees = array_rupees.elements;

	let index = 0;

	return new Promise((resolve)=>{

		let vindex = 0;
		var interval_spin = setInterval(()=>{
			array_rupees[vindex].classList.add("spin");

			if (vindex < array_rupees.length - 1) {

				vindex += 1;
			}
			else {
				clearInterval(interval_spin);
				setTimeout(()=>{

					resolve();
				},1000)
			}
		},60);
	});
}

function complete_green() {
	cp$(".green .meta_concluida").addClass("show");
}

async function set_blue() {

	current_mode = current_mode >= mode_list.length - 1 ? 0 : current_mode + 1;

	let data_sub = await fetch(`https://decapi.me/twitch/subcount/${user_channel}`)
	data_sub = await data_sub.json();

	let el_subcount = cp$("#subcount").get(0);

	el_subcount.innerHTML = `${data_sub}/${meta_sub}`;
	el_subcount.dataset.current = data_sub;
	el_subcount.dataset.target = meta_sub;

	let data_follow = await fetch(`https://decapi.me/twitch/followcount/${user_channel}`);
	data_follow = await data_follow.json();

	let fill_percentage = (data_sub * 100 / meta_sub).toFixed(1);

	if (String(fill_percentage).split(".")[1] == "0") {
		fill_percentage = Math.floor(parseInt(fill_percentage))
	}

	cp$(".blue .meta_concluida").removeClass("show");
	await cp$(".areaLabel,.areaContent,.mainBox .modeBox, .areaContent > .content").addClass("hide");
	await cp$(".areaLabel,.areaContent,.mainBox .modeBox.blue, .areaContent > .content.blue").removeClass("hide");

	await open_modes();

	cp$(".labelBox .modeBox").removeClass("selected");
	cp$(".labelBox .modeBox.blue").addClass("selected");

	let controller = cp$(".content.blue .controller").get(0);

	controller.dataset.value ??= 0
	if (controller.dataset.value == '0') {

		controller.parentElement.classList.add("initial_spawn");
	}

	await animate_controller(controller,parseFloat(fill_percentage), 1, 500);

	setTimeout(()=>{

		controller.parentElement.classList.remove("initial_spawn");
	},1000);

	if (fill_percentage >= 100) {
		await spin_blue();
		complete_blue();
	}

	let other_controller = cp$(".content.green .controller").get(0);
	other_controller.style["left"] = "0%";
	other_controller.dataset.value = 0;
}

async function spin_blue() {

	let array_rupees = cp$(".blue .rupee");
	array_rupees.removeClass("spin");
	array_rupees = array_rupees.elements;

	return new Promise((resolve)=>{

		let vindex = 0;
		var interval_spin = setInterval(()=>{
			array_rupees[vindex].classList.add("spin");

			if (vindex < array_rupees.length - 1) {

				vindex += 1;
			}
			else {
				clearInterval(interval_spin);
				setTimeout(()=>{

					resolve();
				},1500)
			}
		},60);
	});
}

function complete_blue() {
	cp$(".blue .meta_concluida").addClass("show");
}

async function set_red() {

	current_mode = current_mode >= mode_list.length - 1 ? 0 : current_mode + 1;

	let game_playing = await fetch(`https://decapi.me/twitch/game/${user_channel}`)
	game_playing = await game_playing.text();

	cp$(".red .game").get(0).innerHTML = game_playing;

	await cp$(".areaLabel,.areaContent,.mainBox .modeBox, .areaContent > .content").addClass("hide");
	await cp$(".areaLabel,.areaContent,.mainBox .modeBox.red, .areaContent > .content.red").removeClass("hide");

	await open_modes();

	cp$(".labelBox .modeBox").removeClass("selected");
	cp$(".labelBox .modeBox.red").addClass("selected");

	let green_controller = cp$(".content.green .controller").get(0);
	let blue_controller = cp$(".content.blue .controller").get(0);

	green_controller.style["left"] = blue_controller.style["left"] = "0%";
	green_controller.dataset.value  = blue_controller.dataset.value = 0;
}

Number.prototype.clamp = function(min, max) {
	return Math.min(Math.max(this, min), max);
};

// Please use event listeners to run functions.
document.addEventListener('onLoad', function(obj) {
	// obj will be empty for event list
	// this will fire only once when the widget loads
			console.log(obj);

});

document.addEventListener('onEventReceived', function(obj) {
  	// obj will contain information about the event
		console.log(obj);
});