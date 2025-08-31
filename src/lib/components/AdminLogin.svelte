<script>
	import { goto } from '$app/navigation';
	
	let username = '';
	let password = '';
	let isLoading = false;
	let message = '';
	let messageType = '';

	async function handleLogin(e) {
		e.preventDefault();
		
		if (!username || !password) {
			showMessage('Please fill in all fields', 'error');
			return;
		}

		isLoading = true;
		message = '';

		try {
			const response = await fetch('/api/admin/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});

			const data = await response.json();

			if (response.ok) {
				// Store token
				if (typeof window !== 'undefined') {
					localStorage.setItem('adminToken', data.token);
					localStorage.setItem('adminUser', JSON.stringify(data.user));
				}

				// Show success and redirect
				showMessage('Login successful! Redirecting...', 'success');
				setTimeout(() => {
					goto('/admin/dashboard');
				}, 1000);
			} else {
				showMessage(data.error || 'Login failed', 'error');
			}
		} catch (error) {
			showMessage('Network error. Please try again.', 'error');
		} finally {
			isLoading = false;
		}
	}

	function showMessage(text, type) {
		message = text;
		messageType = type;
	}
</script>

<div class="login-container">
	<div class="logo">
		<h1>The Circle</h1>
		<p>Admin Login</p>
	</div>

	<form on:submit={handleLogin}>
		<div class="form-group">
			<label for="username">Username</label>
			<input 
				type="text" 
				id="username" 
				bind:value={username}
				required
				disabled={isLoading}
			>
		</div>

		<div class="form-group">
			<label for="password">Password</label>
			<input 
				type="password" 
				id="password" 
				bind:value={password}
				required
				disabled={isLoading}
			>
		</div>

		<button type="submit" disabled={isLoading}>
			{isLoading ? 'Logging in...' : 'Login'}
		</button>
	</form>

	{#if message}
		<div class="message" class:error={messageType === 'error'} class:success={messageType === 'success'}>
			{message}
		</div>
	{/if}
</div>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: Arial, sans-serif;
		background: #f5f5f5;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
	}

	.login-container {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
	}

	.logo {
		text-align: center;
		margin-bottom: 2rem;
	}

	.logo h1 {
		color: #333;
		font-size: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #333;
		font-weight: bold;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	input:focus {
		outline: none;
		border-color: #007bff;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		margin-top: 1rem;
		transition: background-color 0.3s ease;
	}

	button:hover:not(:disabled) {
		background: #0056b3;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.message {
		margin-top: 1rem;
		text-align: center;
		padding: 0.5rem;
		border-radius: 4px;
	}

	.message.error {
		color: #dc3545;
		background: #f8d7da;
		border: 1px solid #f5c6cb;
	}

	.message.success {
		color: #28a745;
		background: #d4edda;
		border: 1px solid #c3e6cb;
	}
</style>
