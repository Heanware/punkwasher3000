class Washer{

    /* получить весь объект стиральной машины
    *  1.Можно использовать общие метки вроде js-modifier, js-controller, js-indicator
    *  */

    modes = new Map([
        ["default", new Map(
            [["heat", 40], ["time", 5], ["rpm", 1000]]
        )],
        ["intense", new Map(
            [["heat", 90], ["time", 90], ["rpm", 1200]]
        )],
        ["patient", new Map(
            [["heat", 50], ["time", 72], ["rpm", 900]]
        )],
        ["spin", new Map(
            [["heat", 30], ["time", 30]]
        )]
    ]);

    rpm = new Map([
        ["800", 800],
        ["1000", 1000],
        ["1200", 1200]
    ]);

    modesSwiper;
    rpmSwiper;
    barrel = document.getElementById("js-barrel");
    reportField = document.getElementById("js-i-report");
    timeField = document.getElementById("js-i-time");
    timeLeft = 0;
    timerId = 0;
    locked = true;
    closed = false;
    #activeMode = "default";
    #activeRpm = "800";

    set activeMode(mode){
        if(typeof (mode) === "string" && this.modes.has(mode)){
            this.#activeMode = mode;
        }else{
            this.showReport("dont mess the machine!")
        }
    }

    set activeRpm(rpm){
        if(typeof (rpm) === "string" && this.rpm.has(rpm)){
            this.#activeRpm = rpm;
        }else{
            this.showReport("dont mess the machine!")
        }
    }

    constructor(washerImageSelector, modesSelector, rpmSelector){
        let _this = this;
        this.fillSwiperElements("js-modes-list", this.modes);
        this.fillSwiperElements("js-rpm-list", this.rpm);
        let rpmControls = document.getElementById("js-rpm");
        this.rpmSwiper = new Swiper(".js-rpm-swiper", {
            direction: "vertical",
            slidesPerView: 3,
            spaceBetween: 15,
            mousewheel: true,
            centeredSlides: true,
            on: {
                slideChange: function(s){
                    _this.activeRpm = s.slides[s.realIndex].dataset.text;
                }
            }
        });
        this.modesSwiper = new Swiper(".js-modes-swiper", {
            direction: "vertical",
            slidesPerView: 3,
            spaceBetween: 15,
            mousewheel: true,
            centeredSlides: true,
            on: {
                slideChange: function(s){
                    _this.activeMode = s.slides[s.realIndex].dataset.text;
                    _this.timeLeft = 0;
                    if(_this.#activeMode === "spin"){
                        rpmControls.classList.add("rpm-show");
                    }else{
                        rpmControls.classList.remove("rpm-show");
                    }
                }
            }
        });
        document.getElementById("js-machine").addEventListener("click", function(){
            if(_this.locked === true){
                this.classList.toggle("opened");
                _this.closed = _this.closed === false;
            }
        });
        document.getElementById("js-start").addEventListener("click", function(){
            _this.useEngine("start");
        });
        document.getElementById("js-pause").addEventListener("click", function(){
            _this.useEngine("pause");
        });
        document.getElementById("js-stop").addEventListener("click", function(){
            _this.useEngine("stop");
        });
    }

    fillSwiperElements(wrapperId, elements){
        if(elements.size > 0){
            elements.forEach(function callback(element, content){
                let item = document.createElement("div");
                item.classList.add("swiper-slide", "washer__controls--mode-item");
                item.setAttribute("data-text", content);
                item.innerHTML = content;
                document.getElementById(wrapperId).append(item);
            });
        }
    }

    useEngine(cmd){
        let time = this.modes.get(this.#activeMode).get("time");
        switch(cmd){
            case "start":
                if(!this.closed){
                    this.showReport("close the machine!");
                    break;
                }
                this.toggleLock(false);
                let rps;
                if(this.#activeMode !== "spin")
                    rps = this.modes.get(this.#activeMode).get("rpm") / 60;
                else
                    rps = this.rpm.get(this.#activeRpm) / 60;
                if(this.timeLeft === 0)
                    this.timeLeft = this.modes.get(this.#activeMode).get("time");
                this.updateTimer(this.timeLeft+1);
                this.timerId = setInterval(() => {
                    this.updateTimer(this.timeLeft);
                    if(this.timeLeft > 1){
                        this.timeLeft -= 1;
                    }else{
                        this.useEngine("stop");
                    }
                }, 1000);
                this.barrel.setAttribute("style", "animation-duration: " + 1 / rps + "s");
                this.barrel.classList.add("spinning");
                break;

            case "pause":
                this.toggleLock(true);
                this.barrel.classList.remove("spinning");
                clearInterval(this.timerId);
                break;

            case "stop":
                this.toggleLock(true);
                this.updateTimer(1);
                this.barrel.classList.remove("spinning");
                clearInterval(this.timerId);
                this.timeLeft = 0;
                break;
        }
    }

    showReport(reportText){
        let reportField = this.reportField;
        reportField.classList.add("show-report");
        reportField.innerHTML = reportText;
        setTimeout(function(){
            reportField.classList.remove("show-report");
        }, 5000);
    }

    toggleLock(lock){
        this.modesSwiper.allowTouchMove =
            this.modesSwiper.allowSlideNext =
                this.modesSwiper.allowSlidePrev =
                    this.rpmSwiper.allowTouchMove =
                        this.rpmSwiper.allowSlideNext =
                            this.rpmSwiper.allowSlidePrev =
                                this.locked = lock;
    }

    updateTimer(seconds){
        this.timeField.innerHTML = seconds - 1;
    }
}

window.onload = function(){
    let washer = new Washer("js-machine", "js-modes-swiper", "js-rpm-swiper");
};