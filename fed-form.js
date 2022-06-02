class FEDForm {
  constructor(options) {
    try {
      if (!options.formElement)
        throw 'formElement property is not defined in options object'
      if (!options.dataExtension)
        throw 'dataExtension property is not defined in options object'
      if (!options.brand)
        throw 'brand property is not defined in options object'

      const endpoints = {
        CAT: 'https://cloud.email.catfootwear.com/email-submit',
        MER: 'https://cloud.email.merrell.com/email-submit',
        HDF: 'https://cloud.email.harley-davidsonfootwear.com/email-submit'
      }

      this.formElement = options.formElement

      const defaultOptions = {
        successHTML:
          '<p class="success-message">Your email has been submitted.</p>',
        submitButton: this.formElement.querySelector('button[type="submit"]'),
        beforeSubmit: () => {},
        afterSubmit: () => {},
        success: () => {}
      }

      this.options = { ...defaultOptions, ...options }

      this.options.submitButton.addEventListener('click', this.submit)
      this.url = endpoints[options.brand]

      this.fields = [...this.formElement.querySelectorAll('[data-field]')]
      this.fields.forEach(field => {
        field.addEventListener('keyup', e => {
          if (e.keyCode === 13) this.submit()
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  submit = async () => {
    const body = this.formatFormData()

    this.validateEmail(
      this.fields.filter(field => field.type === 'email')[0].value
    )

    if (this.hasError) return

    if (this.errors) this.errors.remove()

    this.formElement.classList.remove('error')
    this.formElement.classList.add('loading')

    this.options.beforeSubmit()

    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(res => res.json())

    this.formElement.classList.remove('loading')
    this.options.afterSubmit()

    if (response.status === 'Error') {
      this.parseError(response)
    } else {
      this.showSuccess()
    }
  }

  formatFormData = () => {
    const array = this.fields.map(field => {
      const key = field.dataset.field
      const value = field.type === 'checkbox' ? field.checked : field.value

      return { Name: key, Value: value }
    })

    return {
      dataExtension: this.options.dataExtension,
      properties: array
    }
  }

  parseError = error => {
    if (error.errorMessage.includes('Violation of PRIMARY KEY')) {
      error.errorCode = 1
      error.errorMessage = 'Email address already exists'
    }

    this.showError([error.errorMessage])
  }

  showError = messages => {
    if (!this.errors) {
      this.errors = document.createElement('p')
      this.errors.classList.add('error-message')
    }

    this.errors.innerHTML = messages
      .map(message => `<span>${message}</span>`)
      .join('')

    this.formElement.prepend(this.errors)
  }

  showSuccess = () => {
    if (this.options.success) this.options.success()
    else this.formElement.innerHTML = this.options.successHTML
  }

  validateEmail = email => {
    const regexp = new RegExp(/^[\w.%+\-]+@[\w.\-]+\.[\w]{2,6}$/)
    const isValid = regexp.test(email)

    this.hasError = !isValid

    if (this.hasError) {
      this.formElement.classList.add('error')

      this.showError([
        this.options.emailErrorMsg || 'Please enter a valid email address'
      ])
    }

    return isValid
  }

  getCookie = cookieName => {
    const cookie = {
      name: cookieName,
      value: document.cookie
        .split(';')
        .filter(c => c.split('=')[0].trim() === cookieName)[0]
        .split('=')[1]
    }

    return cookie
  }
}
