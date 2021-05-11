const elementObjects = {
  container: document.querySelector('#container'),
  currentSign: document.querySelector('#currentSign'),
  announcement: document.querySelector('.announcement'),
  winner: document.querySelector('#winner'),
  messagePlayAgainButton: document.querySelector('#playAgain'),
  messageCloseButton: document.querySelector('#close')
}

const config = {
  start: 'circle', // 'circle' || 'cross'
  currentSign: 'circle', // 'circle' || 'cross'
  winPatterns: ['123', '456', '789', '147', '258', '369', '159', '357'],
  gameStatus: 'playing',
  winner: '',
  winPattern: ''
}

const record = {
  patternO: [],
  patternX: []
}

const view = {
  drawCheckerboard () {
    for (let i = 1; i <= 9; i++) {
      elementObjects.container.innerHTML += `<div class="box" data-number="${i}"></div>`
    }
  },
  drawSign (event) {
    const target = event.target
    // 一局遊戲已結束
    if (config.gameStatus === 'end') return
    // 點到已有下棋的格子
    if (target.classList.length > 1) return
    // 下棋
    if (target.classList.contains('box')) {
      const currentSign = config.currentSign
      const position = target.dataset.number
      switch (currentSign) {
        case 'circle':
          target.classList.add('circle')
          config.currentSign = 'cross'
          elementObjects.currentSign.innerHTML = 'X'
          controller.patternRecord('circle', position)
          controller.checkMatch(config.winPatterns, record.patternO, 'circle')
          return
        case 'cross':
          target.classList.add('cross')
          config.currentSign = 'circle'
          elementObjects.currentSign.innerHTML = 'O'
          controller.patternRecord('cross', position)
          controller.checkMatch(config.winPatterns, record.patternX, 'cross')
      }
    }
  },
  announceWinner () {
    this.boxHighlight()
    elementObjects.currentSign.innerHTML = '---'
    elementObjects.winner.innerHTML = config.winner
    window.setTimeout(() => {
      elementObjects.announcement.classList.remove('hide')
    }, 1000)
  },
  boxHighlight () {
    const winBoxes = config.winPattern.split('')
    winBoxes.forEach(box => {
      document.querySelector(`.box[data-number="${box}"]`).classList.add('box-highlight', 'animate__animated', 'animate__flash')
    })
  },
  resetAllSigns () {
    const allBox = document.querySelectorAll('.box')
    allBox.forEach(box => {
      box.classList.remove('circle')
      box.classList.remove('cross')
      box.classList.remove('box-highlight')
      box.classList.remove('animate__animated')
      box.classList.remove('animate__flash')
    })
  },
  closeMessageBox () {
    elementObjects.announcement.classList.add('hide')
  }
}

const controller = {
  setGameStatus (status) {
    config.gameStatus = status
  },
  patternRecord (pattern, position) {
    switch (pattern) {
      case 'circle':
        record.patternO.push(position)
        return
      case 'cross':
        record.patternX.push(position)
    }
  },
  checkMatch (winPatterns, toCheckPattern, sign) {
    if (toCheckPattern.length < 3) return
    winPatterns.forEach(pattern => {
      const result = toCheckPattern.every(p => pattern.includes(p))
      result === true ? this.markWinner(sign, pattern) : null
    })
  },
  markWinner (sign, pattern) {
    switch (sign) {
      case 'circle':
        config.winner = 'O'
        break
      case 'cross':
        config.winner = 'X'
    }
    this.setGameStatus('end')
    config.winPattern = pattern
    view.announceWinner()
  },
  startNewGame () {
    controller.configUpdate() // this.configUpdate()的this會指向elementObjects.messagePlayAgainButton
    controller.recordUpdate()
    view.resetAllSigns()
    view.closeMessageBox()
  },
  configUpdate () {
    config.start = 'circle'
    config.currentSign = 'circle'
    config.gameStatus = 'playing'
    config.winner = ''
    config.winPattern = ''
  },
  recordUpdate () {
    record.patternO = []
    record.patternX = []
  }
}

// 畫棋盤
view.drawCheckerboard()

// 開始遊戲
controller.setGameStatus('playing')

// 畫記
elementObjects.container.addEventListener('click', view.drawSign)

// 再玩一局
elementObjects.messagePlayAgainButton.addEventListener('click', controller.startNewGame)

// 關閉提示視窗
elementObjects.messageCloseButton.addEventListener('click', view.closeMessageBox)
