// Ruochen Tang - DimSumJS HTML5/CSS3/Javascript Game Framework
// Copyright (C) 2012 Ruochen Tang

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.



//some constants for convinience
var key_right = 37;
var key_up = 38;
var key_left = 39;
var key_down = 40;
var key_space = 32;

//Creates Two Arrays For Object Recycling
var ds_object = new Array();
var ds_recycle = new Array();

//Creates a variables to hold the game DOM object and dimensions
var ds_game, ds_window, ds_loop;
var ds_other = null;
var ds_div = document.createElement('div');
var ds_path = document.location.pathname;
ds_path = ds_path.substring(0, ds_path.lastIndexOf('/')+1);
console.log(ds_path);
var ds_width = screen.width;
var ds_height = screen.height;

//One of the funtions below must be called in order to define ds_game
//Only call one of them below and only call it once...

//creates a fullscreen game, not confined to anything
function ds_create_fullscreen(){
	ds_game = document.createElement('div');
	ds_window = ds_game;
	ds_game.setAttribute('id','dimsumgame');
	ds_game.style.position = "absolute";
	ds_game.style.left = "0px";
	ds_game.style.top = "0px";
	document.body.appendChild(ds_game);
	ds_bind_events();
}

//creates a game of width w and height h that is confined to an iframe
function ds_create_window(w, h){
	ds_game = document.createElement('iframe');
	ds_game.setAttribute('id','dimsumgame');
	ds_game.setAttribute('scrolling','no');
	ds_width = w;
	ds_height = h;
	ds_game.style.width = w;
	ds_game.style.height = h;
	document.body.appendChild(ds_game);
	ds_window = ds_game;
	ds_game = window.frames[0].document.body;
	ds_bind_events();
}

//binds events to the game, call after game is created
function ds_bind_events(){
	ds_game.onkeydown = ds_key_press;
	ds_game.onkeyup = ds_key_release;
	ds_game.onmousemove = ds_mouse_process;
	window.ondevicemotion = ds_accel_process;
}

//starts a game loop that has an t millisecond interval between each frame
function ds_start_loop(t){
	ds_loop = setInterval(function(){
		ds_view.update();
		for (i = 0; i < ds_object.length; i++){
			ds_object[i].update();
		}
	}, t);
}

//stops the game loop
function ds_end_loop(){
	clearInterval(ds_loop);
}

//controls the view
var ds_view = new function(){
    this.x = 0;
    this.y = 0;
    this.hborder = 64;
    this.vborder = 64;
    this.width = ds_width;
    this.hight = ds_height;
    this.follow = null;
    
    this.update = function(){
    	ds_game.style.width = this.width + "px";
	ds_game.style.height = this.height + "px";
        if (this.follow){
            if (this.follow.x < (this.x + this.hborder) && this.x > 0){
                this.x -= this.x + this.hborder - this.follow.x;
            }
            
            if (this.follow.x > (this.width + this.x - this.hborder) && this.x < ds_width-this.width){
                this.x += this.follow.x - (this.width + this.x - this.hborder);
            }
            
            if (this.follow.y < (this.y + this.vborder) && this.y > 0){
                this.y -= this.y + this.vborder - this.follow.y;
            }
            
            if (this.follow.y > (this.height + this.y - this.vborder) && this.y < ds_height-this.height){
                this.y += this.follow.y - (this.height + this.y - this.vborder);
            }
            
        }
    }
}

//sets up variables and calibration for accelerometer
var ds_accel = new function(){
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.DEFAULTX = 0;
    this.DEFAULTY = 0;
    this.DEFAULTZ = 0;
    this.is_calibrated = false;
    this.calibrate = function(xx,yy,zz){
    	accel.DEFAULTX = xx;
    	accel.DEFAULTY = yy;
    	accel.DEFAULTZ = zz;
    	console.log("Calibrated: (" + accel.DEFAULTX + "," + accel.DEFAULTY + "," + accel.DEFAULTZ + ")");
    }

}

//set up variables for mouse
var ds_mouse = new function(){
    this.x = 0;
    this.y = 0;
}

//sets up variable for keys
var ds_key = new Array();
for (var i = 0; i < 256; i++){
	ds_key[i] = false;
}

//processes mouse coordinates
function ds_mouse_process(event){
	ev = event || window.event;
	ds_mouse.x = ev.pageX + ds_view.x;
	ds_mouse.y = ev.pageY + ds_view.y;
}

//processes key presses
function ds_key_press(event){
    if (window.event){
        event = window.event;
    }
    ds_key[event.keyCode] = true;		
};

//process key releases
function ds_key_release(event){
    if (window.event){
        event = window.event;
    }
    ds_key[event.keyCode] = false;
}

//processes mobile accelerometer values
function ds_accel_process(event){
    if (window.event){
	event = window.event;
    }
    if (!ds_accel.is_calibrated){
    	ds_accel.calibrate(event.accelerationIncludingGravity.x,event.accelerationIncludingGravity.y,event.accelerationIncludingGravity.z);
    	ds_accel.is_calibrated = true;
    }
    ds_accel.x = event.accelerationIncludingGravity.x-accel.DEFAULTX;
    ds_accel.y = event.accelerationIncludingGravity.y-accel.DEFAULTY;
    ds_accel.z = event.accelerationIncludingGravity.z-accel.DEFAULTZ;
}

//checks which css3 transform property to use, code modified from zachastronaut's blog
function ds_webkit(element){
    // Note that in some versions of IE9 it is critical that
    // msTransform appear in this list before MozTransform
    // Script taken from ZachAstronaut's blog http://www.zachstronaut.com/
    
    var properties = [
        'transform',
        'WebkitTransform',
        'msTransform',
        'MozTransform',
        'OTransform'
    ];
    
    var ds_webkit_p;
    
    while (ds_webkit_p = properties.shift()) {
        if (typeof element.style[ds_webkit_p] != 'undefined') {
            return ds_webkit_p;
        }
    }
    return false;
}

//destroys ALL instances in the room
function ds_clear_room(){
	for(j = 0; j < ds_object.length; j++){
		ds_object[j].destroy();
	}
	ds_game.innerHTML = "";
}

//creates object at (x,y) with width w and height h and sprite s
function ds_create_object(x,y,w,h,s){
	o = false;
	if (ds_recycle.length > 0){
		o = ds_recycle.pop();
		ds_recycle_object(o,x,y,w,h,s);
	}
	else{
		o = new ds_gameobject(x,y,w,h,s);
	}
	return o;	
}

//resets and object and reuses it, do not call directly, used for optimization in ds_create_object
function ds_recycle_object(obj,x,y,w,h,s){
	obj.reset(x,y,w,h,s);
}

//creates a gameobject, however should not be used directly as it doensn't account for optimization
function ds_gameobject(x, y, w, h, s){
	//add to ds_object
	ds_object.push(this);
	
	//sets all vars to default
	this.reset = function(xx,yy,ww,hh,ss){
		//create div
		this.div = document.createElement('div');
		this.div.style.position = 'absolute';
		//basic positions
		this.x = xx;
		this.y = yy;
		this.width = ww;
		this.height = hh;
		
		//activity
		this.active = true;
		
		//user defined
		this.user = new Object();
		this.type = new Object();
		
		//movement
		this.prevX = 0;
		this.prevY = 0;
		this.speed = 0;
		this.direction = 0;
		this.gravity = 0;
		this.gravity_speed = 0;
		this.gravity_direction = 0;
		
		//images
		this.sprite = ss;
		this.sprite_speed = 0;
		this.sprite_index = 0;
		this.sprite_length = 0;
		this.sprite_interval_count = 0;
		if (this.sprite != 0){
			this.div.style.backgroundImage = 'url(' + this.sprite + ')';
		}
		
		//webkit transforms and css styles
		this.color = 'transparent';
		this.depth = 0;
		this.opacity = 1;
		this.rotateX = 0;
		this.rotateY = 0;
		this.rotateZ = 0;
		this.scaleX = 1;
		this.scaleY = 1;
		
		//convinience's sake
		this.room_bind = false;
		
		//add to document
		ds_game.appendChild(this.div);
		
	}
	//calls reset, sets all vars
	this.reset(x,y,w,h,s);
	
	//step event controls what object does
	this.step = function(){
		//do nothing
	}
	
	//sets the images speeds, interval i, total frames f
	this.setSprite = function(s, i, f){
		this.sprite = s;
		this.sprite_speed = i;
		this.sprite_index = 0;
		this.sprite_length = f;
	}
	
	//animate sprite
	this.animate = function(){
		this.sprite_interval_count++;
		if (this.sprite_interval_count >= this.sprite_speed){
			this.sprite_index++;
			if (this.sprite_index >= this.sprite_length){
				this.sprite_index = 0;
			}
			this.sprite_interval_count = 0;
		}
	}
	
	//destroys the object, adding it to the array to be recycled
	this.destroy = function(){
		this.active = false;
		this.update();
		ds_recycle.push(this);
	}
	
	//adds a type
	this.addType = function(t){
		this.type[t] = true;
	}
	
	//removes a type if it exists
	this.delType = function(t){
		this.type[t] = false;
	}
	
	//checks if a type exists
	this.isType = function(t){
		if (typeof this.type[t] === 'undefined' || this.type[t] == false){
			return false;
		}
		else{
			return true;
		}
	}
	
	//defines an user variable within the object of name n and value v
	this.define = function(n, v){
		this.user[n] = v;
	}
	
	//checks collision with a specific object
	this.collides = function(xx,yy,other){		
		if ((xx < (other.x + other.width)) && ((xx + this.width) > other.x) && (yy < (other.y + other.height)) && ((yy + this.height) > other.y)){
			ds_other = other;
			return true;
		}
		else {
			return false;
		}
	}
	
	//checks collision with type
	this.collides_type = function(xx,yy,type){
		for (j = 0; j < ds_object.length; j++){
			if (ds_object[j] != this && ds_object[j].active){
				if(ds_object[j].isType(type)){
					if(this.collides(xx,yy,ds_object[j])){
						return true;
					}
				}
			}
		}
		return false;
	}
	
	//checks to see if outside room
	this.bordering = function(){
        	if (this.x < 0){
			return 180;
		}
			
		if (this.y < 0){
			return 90;
		}
				
		if (this.x > ds_width-this.width){
			return 360;
		}

		if (this.y > ds_width-this.height){
			return 270;
		}
		return false;
        }
	
	//update event, sort of a blackbox event, auto adjusts everything according to x, y, speed, etc...
	this.update = function(){
		if (this.active){
			this.step();
			this.div.style.display = "block";
			this.prevX = this.x;
			this.prevY = this.y;
			if (this.speed != 0){
				this.x += this.speed*Math.cos((this.direction+180)*Math.PI/180);
				this.y += this.speed*Math.sin((this.direction+180)*Math.PI/180);
			}
			if (this.room_bind){
				if (this.x < 0){
					this.x = 1;
				}
				
				if (this.y < 0){
					this.y = 1;
				}
				
				if (this.x > ds_width-this.width){
					this.x = ds_width-this.width-1;
				}
				
				if (this.y > ds_height-this.height){
					this.y = ds_height-this.height-1;
				}
			}
			this.div.style.opacity = this.opacity;
			this.div.style.top = this.y - ds_view.y + 'px';
			this.div.style.left = this.x - ds_view.x + 'px';
			this.div.style.width = this.width + 'px';
			this.div.style.height = this.height + 'px';
			this.div.style.backgroundColor = this.color;
			this.div.style.backgroundPosition = this.sprite_index * this.width +"px 0";
			this.div.style[ds_webkit(this.div)] = "scale("+this.scaleX+","+this.scaleY+") rotateX("+this.rotateX+"deg) rotateY("+this.rotateY+"deg) rotate("+this.rotateZ+"deg)";
		}
		else{
			this.div.style.display = "none";
		}
	}
}