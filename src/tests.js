function testLogin() {
    console.log('testing login')
    fetch('http://127.0.0.1:8001/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'user', password: 'secret' }),
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
        credentials: 'include'
    })
        .then((response) => {  console.log(response.headers); response.json() })
        .then((json) => console.log(json))
        .catch(error => {
            console.log(error)
        })
}

function testUnSuccessfullLogin() {
    console.log('testing login')
    fetch('http://127.0.0.1:8001/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'user', password: 'secret2' }),
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
    })
        .then((response) => response.json())
        .then((json) => console.log(json))
        .catch(error => {
            console.log(error)
        })
}

function testSendMessage() {
    console.log('testing sendmsg')
    fetch('http://127.0.0.1:8001/message', {
        method: 'POST',
        body: JSON.stringify({ from: 'martin', message: 'text', to:'you' }),
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
    })
        .then((response) => response.json())
        .then((json) => console.log(json))
        .catch(error => {
            console.log(error)
        })
}

testLogin();
//testUnSuccessfullLogin();
//testSendMessage();