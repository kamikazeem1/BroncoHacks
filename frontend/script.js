fetch('/api/hello')
  .then(res => res.json())
  .then(data => {
    document.getElementById('message').textContent = data.message;
  });

//fetch Groq api
fetch('/api/groq', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ emailText: 'Test email message here.' })
})
  .then(res => res.json())
  .then(data => {
    console.log(data.message); // Should say: "Email received by backend!"
  });

  //email check
  fetch('/api/check-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' })
  })
    .then(res => res.json())
    .then(data => console.log('Email check:', data.result));

  //phone check
  fetch('/api/check-phone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+14155552671' })
  })
    .then(res => res.json())
    .then(data => console.log('Phone check:', data.result));

  //url check
  fetch('/api/check-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'http://phishingsite.com' })
  })
    .then(res => res.json())
    .then(data => console.log('URL check:', data.result));



  