export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Route to start the login process
    if (url.pathname === '/api/login') {
      const clientId = env.GOOGLE_CLIENT_ID;
      // We must tell Google where to send the user back to
      const redirectUri = `${url.origin}/api/callback`;
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;
      
      return Response.redirect(googleAuthUrl, 302);
    }

    // 2. Route to handle the callback from Google
    if (url.pathname === '/api/callback') {
      const code = url.searchParams.get('code');
      const clientId = env.GOOGLE_CLIENT_ID;
      const clientSecret = env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `${url.origin}/api/callback`;

      if (!code) {
        return new Response('No code provided from Google', { status: 400 });
      }

      // Exchange the code for an access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response(`Error: ${tokenData.error_description}`, { status: 400 });
      }

      // Get user info using the access token
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const user = await userResponse.json();

      // Success! For now, let's just show a success message with their name.
      // In a real app, you would set a cookie/session here and redirect to the homepage.
      return new Response(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1>Login Successful! 🎉</h1>
            <p>Welcome, ${user.name} (${user.email})</p>
            <a href="/">Go back to homepage</a>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    // 3. For any other request (like / or /style.css), serve the static files.
    return env.ASSETS.fetch(request);
  }
};