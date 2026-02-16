import { imageFrameCycler } from './image-frame-cycler.js';

export function getDeviceType() {
    const width = window.innerWidth;

    if (width > 1766) {
        return 'desktop';
    } else if (width > 700) {
        return 'tablet';
    } else if (width > 450) {
        return 'mobile';
    } else {
        return 'phone'
    }
}

export function getAtomizerImageSize() {
    const deviceType = getDeviceType();
    switch(deviceType) {
        case 'phone':
            return {
                width: 280,
                height: 278,
            };
        case 'mobile':
            return {
                width: 320,
                height: 318,
            };
        case 'tablet':
            return {
                width: 500,
                height: 499,
            };
        case 'desktop':
            return {
                width: 703,
                height: 699,
            };
        default:
            return {
                width: 500,
                height: 499,
            };
    }
}

export function debounce(func, delay) {
    var timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout( () => {
            func.apply(this, args);
        }, delay)
    }
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getElementProps(element) {
    if (!(element instanceof HTMLElement)) {
      console.warn("Invalid input: Please provide a valid HTML element.");
      return null;
    }
  
    const rect = element.getBoundingClientRect();
  
    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      x: rect.x, // x and y are often equivalent to left and top, but included for completeness
      y: rect.y
    };
}

export function timeSince(dateInput, includeDays = false) {
    const now = new Date();
    const inputDate = new Date(dateInput);
  
    // Extract differences
    let years = now.getFullYear() - inputDate.getFullYear();
    let months = now.getMonth() - inputDate.getMonth();
    let days = now.getDate() - inputDate.getDate();
  
    // Adjust if negative
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonth;
    }
  
    if (months < 0) {
      years -= 1;
      months += 12;
    }
  
    // Build output
    let parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (includeDays && days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  
    return parts.length > 0 ? parts.join(', ') : 'Today';
}

export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Twinkler logic (class)
export class Twinkler {
    constructor(twinkleElem, randomRange) {
        this.twinkleElement = twinkleElem;
        this.randomRange = {
            low: randomRange[0],
            high: randomRange[1],
        }
        this.timer = null;
        this.hasStarted = false;
    }

    twinkle() {
        gsap.to(this.twinkleElement, {
            duration: .2,
            scale: 1,
            rotation: 180,
            ease: 'none',
            repeat: 1,
            yoyo: true
        });
    }

    _cycleTwinkler = () => {
        const randomWait = getRandomInt(this.randomRange.low, this.randomRange.high);
        this.twinkle();
        // recursively twinkle with random wait duration.
        this.timer = setTimeout( this._cycleTwinkler, randomWait);
    }

    start() {
        // Don't start the twinkler if it's already been started
        if (! this.hasStarted ) {
            this._cycleTwinkler();
            this.hasStarted = true;
        }
    }

    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
            this.hasStarted = false;
        }
    }
}
class MagnifyArm {
    constructor(framesSelector, randomRange = [7000, 16000]) {
        this.armCycler = imageFrameCycler(framesSelector, { targetFPS: 20, shouldReverse: true });
        this.animationId = null;
        this.randomRange = {
            low: randomRange[0],
            high: randomRange[1],
        };
        this.timer = null;
        this.stopped = false;
    }

    _doFrameCycle = () => {
        if (! this.stopped) {
            const randomWait = getRandomInt(this.randomRange.low, this.randomRange.high);
            this.animationId = requestAnimationFrame((timestamp) => { this.armCycler.doFrameCycle(timestamp, 0, true, false)});
            this.timer = setTimeout(this._doFrameCycle, randomWait);
        }
    }

    start = () => {
        this.armCycler.resetCycler();
        this.stopped = false;
        this._doFrameCycle();
    }

    stop = () => {
        this.stopped = true;
        clearTimeout(this.timer);
        this.armCycler.stopCycler();
    }
}

export { MagnifyArm };

export function asciiArtToConsole() {
console.log(`
  _____ _ _ _       _   _   ____                                                          
 | ____| | (_) ___ | |_| |_|  _ \\ _ __ ___   __ _ _ __ __ _ _ __ ___  _ __ ___   ___ _ __ 
 |  _| | | | |/ _ \\| __| __| |_) | '__/ _ \ / _ \` | '__/ _\` | '_ \` _ \\| '_ \` _ \\ / _ \\ '__|
 | |___| | | | (_) | |_| |_|  __/| | | (_) | (_| | | | (_| | | | | | | | | | | |  __/ |   
 |_____|_|_|_|\\___/ \\__|\\__|_|   |_|  \\___/ \\__, |_|  \\__,_|_| |_| |_|_| |_| |_|\\___|_|   
                                            |___/                                         
`);
console.log('');
console.log(`
                                                   .:::--:::..                                      
                                             .=+++=-----------=++=:                                 
                                       +++++=----------------------++-.                             
                                       .++=---------------------------+=.=:                         
                                    .-+=------------=+--=+=-------------+:+.                        
                                   :+=+++++++---+++++++=*+=-------=+++---+++==+.                    
                                   +-.+=++-+++=----------------------=------+=.                     
                                    .+-+=----------------------------+--------+.                    
                                    +=-+-----------------------------+---------+.                   
                                   :+-+=-----------------------------+----=----=-                   
                                   -+=*------------------------------+----------+                   
                                   .+=+------------------------------=+----=----+                   
                                    =+=--=+++++---------=++++++=------+=-------=-                   
                                    :+=++++++++*=------=+++*++++++-----+=------+:                   
                                     +=+=-----------------------=+=----+=------+.                   
                                     -=----++++--+-------=++++----------+-----+.                    
                                    =**--=*::==--+=-----*-::=--+--------+---+*+=.                   
                                   -+=*--=::**=*-+=-----:::#*#-:--------*-==----*.                  
                                   -+=*---::=##-=+-------::+##:---------++--=*+-+-                  
          .--. .==-                .+=*--------=+-----------------------=--+++==+-                  
         .*--+-+=-=+.               -**-------=+--------------------------==+==-+:                  
      =*+-+---+==--=-                -*-------*-----------------------------+==+=                   
     .+--=**---*+---*.                +=------=*=---=++---------------------=-=+.                   
     .-=---*=---*=--+-    .--.        -+---=-----===---------+++--------=---=*-                     
   ===+*=---*---=+---*.  =*--=+.       +=--=++------------++=----------++*++:                       
   ==---*=--=+---+==-+= .*---*-        -+------=+++**++++-------------=*                            
    ==---*=--=++=-----+-*---=+.         =+-------==------------------=*.                            
     =+---*++=---------+*---*.           =+---------=---------------=*:                             
      -+-==----------+=----=+            .+=-----------------------*+*.                             
       ==-----------*------*:             .++-------------------+*=--*.                             
        +=---------+------+=                -*=-------------==*+==---*+=:                           
        .*---------=-----=*.                  :+*++++++++**+====-----+--==+-.                       
         :+-------------**.                 =++-=-=*===========-----+--=-----++=.                   
          .*=---------+*:              .-++=----=--*=========-----+=--=---------=++-.               
            -*==-------==           .=+=---------=--++==------==+---=---------------=+-.            
             :+--------=*         -+=-------------=---==+++===----=----------------+=--+=.          
             -+--------=+.      :+=--=---------------+=-------+=-----------------=------=+.         
             -+---------*.    :+=----=------------------------------------------+--------==         
             -+----------*. .+=-----=+-----------------------------------------+----------=-        
             -+----------*:==-------=+-----------------------------------------------------+.       
             =+----------=*---------=+----------------------------------------=------------==       
             ==-----------+=-----==-=+------------------------------------------------------+.      
             ==-----------=*+-----===+------------------------------------------------------=-      
             ==------------+=+-----==+---------------------------------------=---------------+.     
             =+------------=+-+=--===+--------------------------------------===--------------=-     
             -+-------------+--+=====+---------------------------------------=+---------------+.    
             .+=---------------=+====+=--------------------------------------=+--------------=+:    
              .*=------------===+===+-+--------------------------------------==+----------=+++-     
               .+=----------====*++: :+-------------------------------------===+=----=+++===--*.    
                 -+=----====++-.:.   :+-------------------------------------====-++=====------+-    
                   .-++*+=-.         :+-------------------------------------====-.+=----------==    
                                     .+-------------------------------------===+: :*-----------+    
                                     .+-------------------------------------===+: .*-----------+    
`);
}