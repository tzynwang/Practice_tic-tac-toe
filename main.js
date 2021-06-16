const elementObjects = {
  gamePlayerSetting: document.querySelector('.game-player'),
  gameArea: document.querySelector('.game-area'),
  container: document.querySelector('#container'),
  currentSign: document.querySelector('#currentSign'),
  announcement: document.querySelector('.announcement'),
  announcementMessage: document.querySelector('#announcementMessage'),
  messagePlayAgainButton: document.querySelector('#playAgain'),
  messageCloseButton: document.querySelector('#close')
}

const config = {
  start: 'circle',
  currentSign: 'circle', // 'circle' || 'cross'
  gameStatus: '',
  playerOne: { role: '', sign: 'circle' },
  playerTwo: { role: '', sign: 'cross' },
  computer: '',
  winPatterns: ['123', '456', '789', '147', '258', '369', '159', '357'],
  winPattern: '',
  winner: ''
}

const record = {
  availableBoxes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
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
    const position = Number(target.dataset.number)
    // 已結束
    if (config.gameStatus !== 'playing') return
    // 點到已有畫記的格子
    if (!record.availableBoxes.includes(position)) return
    // 下棋
    if (target.classList.contains('box')) {
      const currentSign = config.currentSign
      target.classList.add(currentSign)
      controller.patternRecord(currentSign, position)
      record.availableBoxes.splice(record.availableBoxes.indexOf(position), 1)
      switch (currentSign) {
        case 'circle':
          config.currentSign = 'cross'
          elementObjects.currentSign.innerHTML = 'X'
          controller.checkMatch(config.winPatterns, record.patternO, 'circle')
          break
        case 'cross':
          config.currentSign = 'circle'
          elementObjects.currentSign.innerHTML = 'O'
          controller.checkMatch(config.winPatterns, record.patternX, 'cross')
      }
    }
    // PVC模式
    if (config.computer !== undefined) {
      view.computerDrawSign(config.computer)
    }
  },
  computerDrawSign (player) {
    // 已結束
    if (config.gameStatus !== 'playing') return
    // 準備畫記
    const computerSign = config[player].sign
    const canDrawBoxes = record.availableBoxes
    const index = ~~(Math.random() * canDrawBoxes.length)
    // 畫記
    document.querySelector(`.box[data-number="${canDrawBoxes[index]}"]`).classList.add(computerSign)
    // 記錄格位，更新可畫記格位
    controller.patternRecord(computerSign, canDrawBoxes[index])
    record.availableBoxes.splice(index, 1)
    // 更新UI，檢查是否連線
    switch (computerSign) {
      case 'circle':
        config.currentSign = 'cross'
        elementObjects.currentSign.innerHTML = 'X'
        controller.checkMatch(config.winPatterns, record.patternO, 'circle')
        break
      case 'cross':
        config.currentSign = 'circle'
        elementObjects.currentSign.innerHTML = 'O'
        controller.checkMatch(config.winPatterns, record.patternX, 'cross')
    }
  },
  announceWinner () {
    this.boxHighlight()
    elementObjects.currentSign.innerHTML = '---'
    elementObjects.announcementMessage.innerHTML = `Winner is: ${config.winner}`
    window.setTimeout(() => {
      elementObjects.announcement.classList.remove('hide')
    }, 1000)
  },
  announceEven () {
    elementObjects.currentSign.innerHTML = '---'
    elementObjects.announcementMessage.innerHTML = 'Game Even'
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
  hideTarget (target) {
    target.classList.add('hide')
  },
  displayTarget (target) {
    target.classList.remove('hide')
  }
}

const controller = {
  setGamePlayer (event) {
    const target = event.target
    if (target.tagName === 'BUTTON') {
      config.playerOne.role = target.dataset.playerone
      config.playerTwo.role = target.dataset.playertwo
    }
    config.computer = target.dataset.computer
    view.hideTarget(elementObjects.gamePlayerSetting)
    view.displayTarget(elementObjects.gameArea)
    // 電腦先手
    if (config.playerOne.role === 'computer') {
      view.computerDrawSign(config.computer)
    }
  },
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
    // 畫記數量不足3
    if (toCheckPattern.length < 3) return
    // 檢查畫記組合
    winPatterns.forEach(pattern => {
      const result = toCheckPattern.filter(p => pattern.includes(p))
      result.length >= 3 ? this.markWinner(sign, pattern) : null
    })
    // 判定平手
    if (record.availableBoxes.length === 0) view.announceEven()
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
    view.hideTarget(elementObjects.announcement)
    // 電腦先手
    if (config.playerOne.role === 'computer') {
      view.computerDrawSign(config.computer)
    }
  },
  configUpdate () {
    config.start = 'circle'
    config.currentSign = 'circle'
    config.gameStatus = 'playing'
    config.winner = ''
    config.winPattern = ''
  },
  recordUpdate () {
    record.availableBoxes = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    record.patternO = []
    record.patternX = []
  }
}

// 畫棋盤
view.drawCheckerboard()

// 選擇模式
elementObjects.gamePlayerSetting.addEventListener('click', controller.setGamePlayer)

// 開始遊戲
controller.setGameStatus('playing')

// 畫記
elementObjects.container.addEventListener('click', view.drawSign)

// 再玩一局
elementObjects.messagePlayAgainButton.addEventListener('click', controller.startNewGame)

// 關閉提示視窗
elementObjects.messageCloseButton.addEventListener('click', () => {
  view.hideTarget(elementObjects.announcement)
})
