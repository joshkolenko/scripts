class RandomPrize {
  constructor(prizes = []) {
    this.prizes = prizes
  }

  addPrize = (weight = 0, data = {}) => {
    if (weight < 1) {
      throw new Error('Weight must be greater than 0')
    }

    this.prizes.push({ weight, data })
  }

  getPrizes = () => this.prizes

  getRandomPrize = () => {
    if (this.prizes.length < 2) {
      throw new Error('Prizes array length must be greater than 1')
    }

    let weightedArray = []

    this.prizes.forEach((prize, index) => {
      for (let i = 0; i < prize.weight; i++) {
        weightedArray.push(index)
      }
    })

    const shuffledArray = weightedArray.sort(() => 0.5 - Math.random())

    const randomNumber = Math.floor(Math.random() * weightedArray.length)
    const randomPrizeIndex = shuffledArray[randomNumber]

    const { data } = this.prizes[randomPrizeIndex]

    return data
  }
}

class SpinToWin extends RandomPrize {
  constructor(wheelElement, prizes = [], startingAngle = 0, clockwise = true) {
    super(prizes)

    if (!wheelElement) throw new Error('Wheel element is required')

    this.wheelElement = wheelElement
    this.startingAngle = startingAngle
    this.clockwise = clockwise

    this.wheelElement.style.pointerEvents = 'none'
    this.wheelElement.style.transform = `rotate(${this.startingAngle}deg)`
  }

  spinWheel = (
    numberOfSpins = 8,
    duration = 10000,
    easing = 'cubic-bezier(0.3, 0, 0, 1)'
  ) => {
    if (!this.wheelElement) throw new Error('Wheel element is not defined')

    const data = this.getRandomPrize()

    if (!data || data.angle === undefined) {
      throw new Error('Prize data object must have angle property')
    }

    let degrees = numberOfSpins * 360 + data.angle

    if (!this.clockwise) degrees = -degrees + this.startingAngle
    else degrees = degrees - this.startingAngle

    const wheelPromise = new Promise(resolve => {
      this.wheelElement.animate(
        [
          { transform: `rotate(${this.startingAngle}deg)` },
          { transform: `rotate(${degrees}deg)` }
        ],
        {
          duration,
          easing,
          iterations: 1
        }
      )

      this.wheelElement.style.transform = `rotate(${degrees}deg)`

      setTimeout(() => {
        resolve(data)
      }, duration)
    })

    return wheelPromise
  }

  rotateWheel = angle => {
    if (!this.clockwise) angle = -angle
    this.wheelElement.style.transform = `rotate(${angle}deg)`
  }
}
