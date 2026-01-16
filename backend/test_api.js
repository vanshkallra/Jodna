const API_URL = 'http://localhost:5000/auth';

async function testSignup() {
    try {
        const user = {
            displayName: 'Test User ' + Date.now(),
            email: `test${Date.now()}@example.com`,
            password: 'password123'
        };
        console.log('Testing Signup with:', user);

        const res = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Signup Failed: ${res.status} ${errText}`);
        }

        const data = await res.json();
        console.log('Signup Success:', data);
        return data;
    } catch (err) {
        console.error(err.message);
    }
}

async function testLogin(email) {
    try {
        const creds = {
            email: email,
            password: 'password123'
        };
        console.log('Testing Login with:', creds);

        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(creds)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Login Failed: ${res.status} ${errText}`);
        }

        const data = await res.json();
        console.log('Login Success:', data);
    } catch (err) {
        console.error(err.message);
    }
}

async function run() {
    const newUser = await testSignup();
    if (newUser) {
        await testLogin(newUser.email);
    }
}

run();
