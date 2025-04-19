fetch('/api/hello')
  .then(res => res.json())
  .then(data => {
    document.getElementById('message').textContent = data.message;
  });

<<<<<<< HEAD
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



  
=======
  function displayForm() {
    //hide all active form sections
    document.getElementById('email-section').style.display = "none";
    document.getElementById('text-section').style.display = "none";
    document.getElementById('link-section').style.display = "none";

    switch(document.getElementById('feature-select').value) {// unhides the section for the selected feature
      case "select":
        alert("Please select a feature from the dropdown menu");
        break;
      case "email":
        document.getElementById('email-section').style.display = "block";
        break;
      case "text":
        document.getElementById('text-section').style.display = "block";
        break;
      case "link":
        document.getElementById('link-section').style.display = "block";
    }
  }
>>>>>>> 42ca2bce1d18ca01221720d1bfde7a88fc5eb0b6
