export default defineEventHandler(async (event) => {
  console.log('Cron job running at', new Date().toISOString());
  // Add your specific task logic here (e.g., fetching data, updating a database)
  
  const cronSecret = process.env.CRON_SECRET;
  const authorizationHeader = event.req.headers.authorization;

  if (authorizationHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

    console.log('Secure cron job running...');
  return new Response('Cron job executed successfully!');
});