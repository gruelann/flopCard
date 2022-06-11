// model
const models = {
    poker: [], // 撲克順序

    // 產生亂數52張牌的位置
    creatPoker() {
        let pokerMark = {}
        for (let i = 0; i < 52; i++) {
            let rand = Math.round(Math.random() * 51)
            if (typeof pokerMark[rand] === 'undefined' && rand !== pokerMark[rand]) {
                pokerMark[rand] = i
            } else {
                i--
            }
        }
        this.poker = pokerMark
    },

}

const View = {
    // 起始渲染撲克牌
    showPoker(pokerData) {
        for (let i in pokerData) {
            let pokerItem = `
                <div class="card-item" data-index="${pokerData[i]}">
                    <div class="card">
                        <div class="card-img ${this.transCardClass(pokerData[i])}"></div>
                        <div class="card-back"></div>
                    </div>
                </div>`
            $(".cards").append(pokerItem)
        }
    },
    // index to class
    transCardClass(index) {
        const colorArr = ['a', 'b', 'c', 'd']
        let color = Math.trunc(index / 13)
        let number = index % 13 + 1
        return "poker_" + colorArr[color] + number
    },
    // 翻牌
    flipCards(cardItems) {
        cardItems.map(cardItem => {
            $(cardItem).children("div").toggleClass("is_active")
        })
    },
    // 分數增加
    showScore(score) {
        $(".score").addClass("highlight")
        let nowScore = $(".score").text() * 1
        if (nowScore === score) {
            $(".score").removeClass("highlight")
            return
        }
        $(".score").text(nowScore + 1)
        setTimeout(function() {
            View.showScore(score)
        }, 50)
    },
    // 時間渲染
    showTimer(time) {
        if (time % 1 === 0) time += ".0"
        $(".timer").text(time)
    }
}


// Controller
const Controller = {
    status: "START_GAME",
    openCardList: [],
    score: 0,
    startTime: null,
    timeCount: 0,
    // 翻牌事件聆聽
    cardClickEven() {
        const _this = this
        $(".card-item").on("click", function() {
            if (_this.status === "METCHING") return
            if ($(this).children("div").hasClass("is_active")) return
            View.flipCards([$(this)])
            _this.openCardList.push(this)
            switch (_this.status) {
                case "START_GAME":
                    Controller.startTimre()
                    _this.status = "SECOND_CARD"
                    break
                case "FIRST_CARD":
                    _this.status = "SECOND_CARD"
                    break
                case "SECOND_CARD":
                    _this.status = "METCHING"
                    if (_this.checkMetch(_this.openCardList)) {
                        // 配對成功 
                        _this.status = "FIRST_CARD"
                        _this.openCardList = []
                        _this.score += 10
                        View.showScore(_this.score)
                        if (_this.score === 260) _this.status = "WIN_GAME"
                    } else {
                        // 配對失敗
                        setTimeout(function() {
                            View.flipCards(_this.openCardList)
                            _this.status = "FIRST_CARD"
                            _this.openCardList = []
                        }, 1000)
                    }
                    break
            }

        })
    },
    // 檢查是否配對
    checkMetch(cards) {
        const card1 = $(cards[0])
        const card2 = $(cards[1])
        if (card1.data("index") % 13 === card2.data("index") % 13) {
            return true
        } else {
            return false
        }
    },
    startTimre() {
        if (this.status === "WIN_GAME") return
        if (this.startTime === null) this.startTime = new Date().getTime()
        let nowTime = new Date().getTime()
        this.timeCount = Math.trunc((nowTime - this.startTime) / 100) / 10
        View.showTimer(this.timeCount)
        setTimeout(function() {
            Controller.startTimre()
        }, 100)

    }
}

// 初始化撲克牌位置
models.creatPoker()
View.showPoker(models.poker)
Controller.cardClickEven()