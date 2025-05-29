export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'nipa-travel-frontend',
    version: '1.0.0'
  });
}