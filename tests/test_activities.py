def test_get_activities(client):
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    # Expect some known activities from the in-memory data
    assert "Chess Club" in data


def test_signup_and_remove_participant(client):
    activity = "Chess Club"
    email = "teststudent@mergington.edu"

    # Ensure email is not already in participants
    resp = client.get("/activities")
    participants = resp.json()[activity]["participants"]
    if email in participants:
        # remove it first to ensure consistent test
        client.delete(f"/activities/{activity}/participants?email={email}")

    # Sign up the test user
    signup = client.post(f"/activities/{activity}/signup?email={email}")
    assert signup.status_code == 200
    assert "Signed up" in signup.json().get("message", "")

    # Confirm participant added
    resp = client.get("/activities")
    participants = resp.json()[activity]["participants"]
    assert email in participants

    # Now remove participant
    delete = client.delete(f"/activities/{activity}/participants?email={email}")
    assert delete.status_code == 200
    assert "Removed" in delete.json().get("message", "")

    # Confirm participant removed
    resp = client.get("/activities")
    participants = resp.json()[activity]["participants"]
    assert email not in participants
