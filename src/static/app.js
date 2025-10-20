document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

          // Build main content
          activityCard.innerHTML = `
            <h4>${name}</h4>
            <p>${details.description}</p>
            <p><strong>Schedule:</strong> ${details.schedule}</p>
            <p class="availability"><strong>Availability:</strong> ${spotsLeft} spots left</p>
          `;

        // Create participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeader = document.createElement("h5");
        participantsHeader.innerHTML = `Participants <span class="participant-count">${details.participants.length}</span>`;
        participantsSection.appendChild(participantsHeader);

        const ul = document.createElement("ul");
        ul.className = "participants-list";

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            const span = document.createElement("span");
            span.className = "participant-email";
            span.textContent = p;

            const btn = document.createElement("button");
            btn.className = "participant-delete";
            btn.title = "Remove participant";
            btn.innerHTML = "&times;";

            // Attach delete handler
            btn.addEventListener("click", async (ev) => {
              ev.preventDefault();

              // Call unregister API
              try {
                const resp = await fetch(
                  `/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(p)}`,
                  { method: "DELETE" }
                );

                const result = await resp.json();

                if (resp.ok) {
                  // Remove the list item from the UI
                  li.remove();

                  // Update participant count badge
                  const countBadge = activityCard.querySelector(".participant-count");
                  if (countBadge) {
                    const newCount = Math.max(0, parseInt(countBadge.textContent || "0", 10) - 1);
                    countBadge.textContent = newCount;
                  }

                  // Update availability text
                  const availability = activityCard.querySelector(".availability");
                  if (availability) {
                    // Extract current spots from text and increment
                    const availabilityMatch = availability.textContent.match(/(\d+) spots left/);
                    if (availabilityMatch) {
                      const currently = parseInt(availabilityMatch[1], 10);
                      availability.innerHTML = `<strong>Availability:</strong> ${currently + 1} spots left`;
                    }
                  }

                  // If no participants remain, show placeholder
                  if ((ul.querySelectorAll("li.participant-item").length) === 0) {
                    const placeholder = document.createElement("li");
                    placeholder.textContent = "No participants yet";
                    placeholder.className = "no-participants";
                    ul.appendChild(placeholder);
                  }
                } else {
                  console.error("Failed to remove participant:", result);
                  alert(result.detail || result.message || "Failed to remove participant");
                }
              } catch (error) {
                console.error("Error removing participant:", error);
                alert("Error removing participant. See console for details.");
              }
            });

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No participants yet";
          li.className = "no-participants";
          ul.appendChild(li);
        }

        participantsSection.appendChild(ul);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
