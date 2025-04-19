fetch('/api/hello')
  .then(res => res.json())
  .then(data => {
    document.getElementById('message').textContent = data.message;
  });

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