class ResponsiveFont {
  constructor(selector) {
    this.el = document.querySelector(selector)

    if (!this.el) throw new Error(`No element found with selector: ${selector}`)

    window.addEventListener('resize', this.setFontSize)

    this.setFontSize()
  }

  setFontSize = () => {
    if (window.innerWidth > 576) {
      this.el.style.fontSize = this.el.offsetWidth / 30.8 + 'px'
    } else {
      this.el.style.fontSize = this.el.offsetWidth / 54.6 + 'px'
    }
  }
}
