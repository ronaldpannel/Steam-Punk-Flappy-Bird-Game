class Audio{
    constructor(){
        this.flap1 = document.getElementById('flap1')
        this.flap2 = document.getElementById('flap2')
        this.flap3 = document.getElementById('flap3')
        this.flap4 = document.getElementById('flap4')
        this.flap5 = document.getElementById('flap5')
        this.charge = document.getElementById('charge')
        this.lose = document.getElementById("lose");
        this.win = document.getElementById('win')

        this.flapSoundsArray = [this.flap1, this.flap2, this.flap3, this.flap4, this.flap5];
    }
    play(sound){
        sound.currentTime = 0
        sound.play()
    }
}