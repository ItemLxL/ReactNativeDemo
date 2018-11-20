module.exports = {
    header:{
        method:'POST',
        headers:{
            'Accept':'application/json',
            'Content-Type':'application/json'
        }
    },
    api:{
        base:'http://rap2api.taobao.org/app/mock/94621/',
        creations:'example/lists',
        up:'example/up',
        comment:'example/comments',
        sendComment:'example/sendComment',
        signUp:'example/sendCode',
        verify:'example/login',
    }
}