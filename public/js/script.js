document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // stop page reload

    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;

    const response = await fetch("/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, age })
    });

    const data = await response.json();
    console.log(data);

    alert("User added!");
});

// Initial load
loadUsers();