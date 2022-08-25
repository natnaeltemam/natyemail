document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));

  document.querySelector("#compose").addEventListener("click", compose_email);
  document.querySelector("#compose_form").addEventListener("submit", (e) => {
    e.preventDefault();
    const resever = document.querySelector("#compose-recipients");
    const subject = document.querySelector("#compose-subject");
    const body = document.querySelector("#compose-body");

    const rev = resever.value;
    const sub = subject.value;
    const bod = body.value;
    send(rev, sub, bod);
    load_mailbox("sent");
  });

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;
  methods(mailbox);
}
function methods(mailbox) {
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      // Print emails

      if (emails.lenght !== 0) {
        for (let a = 0; a < emails.length; a++) {
          const ndw = document.createElement(`div`);
          const sender_recever =
            mailbox === "inbox" ? emails[a].sender : emails[a].recipients[0];
          const read_not = emails[a].read ? "white" : "gray";

          ndw.classList.add("emaillister", "border", read_not);
          ndw.setAttribute("id", emails[a].id);
          ndw.innerHTML = `<div class="list">
                <p class="sender"><strong>${sender_recever}</strong></p>
                <p class="subject">${emails[a].subject}</p>
                </div><div class="time"><p class="times">${emails[a].timestamp}</p></div>`;
          ndw.addEventListener("click", () => {
            showEmail(emails[a], emails[a].id, mailbox);
          });
          document.querySelector("#emails-view").appendChild(ndw);
        }
      }

      // ... do something else with emails ...
    });
}
function send(recipients, subject, body) {
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Print result
      console.log(result);
    });
}

function showEmail(emails, id, mailbox) {
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-view").style.display = "block";

  const archive = emails.archived ? "Unarchiver" : "archive";
  const archive_button =
    mailbox === "sent"
      ? ""
      : `<button class="btn btn-sm btn-outline-primary" id="archive_email">${archive}</button>`;
  const email = document.querySelector("#email-view");
  email.innerHTML = `<p id="from"><strong>From: </strong>${emails.sender}</p>
  <p id="to"><strong>To: </strong>${emails.recipients[0]}</p>
  <p id="subject"><strong>Subject: </strong>${emails.subject}</p>
  <p id="timestamp"><strong>Timestamp: </strong>${emails.timestamp}</p>
  <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
  
  ${archive_button}
  <hr />
  <p id="body">${emails.body}</p>`;
  if (mailbox !== "sent") {
    document.querySelector("#archive_email").addEventListener("click", () => {
      archive_email(emails.id, emails.archived);
    });
  }
  document.querySelector("#reply").addEventListener("click", () => {
    replay_email(emails);
  });
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

function archive_email(id, archive) {
  if (archive) {
    fetch(`/emails/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        archived: false,
      }),
    });
    load_mailbox("archive");
  } else {
    fetch(`/emails/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        archived: true,
      }),
    });
    load_mailbox("inbox");
  }
}
function replay_email(email) {
  compose_email();
  document.querySelector("#compose-recipients").value = email.sender;
  document.querySelector("#compose-subject").value = `Re: ${email.subject}`;
  document.querySelector(
    "#compose-body"
  ).value = `on ${email.timestamp}  ${email.sender} wrote: ${email.body}`;

  console.log(email);
}
