class Nodel {
    constructor(value) {
        this.value = value
        this.next = null
    }
}
class Queue {
    constructor() {
        this.first = null
        this.last = null
        this.size = 0
    }
    enqueue(value) {
        let newel = new Nodel(value)
        if(this.size === 0) {
            this.first = newel
        } else {
        this.last.next = newel
        }
        this.last = newel
        this.size++
        return this.size
    }
    dequeue() {
        if(this.first == null) 
            return null
        let res = this.first
        if(this.size === 1){
            this.last = null
            this.first = null
        } else {
            this.first = this.first.next
        }
        this.size--
        return res.value
    }
}
module.exports = Queue