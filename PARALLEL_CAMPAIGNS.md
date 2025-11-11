# Parallel Campaign Sending Configuration

## Overview

Mailtrain has been enhanced to support sending multiple campaigns in parallel, dramatically improving throughput for organizations managing multiple email campaigns simultaneously.

## How It Works

### Before (Default Behavior)
- Only 1 campaign was processed at a time
- Even with multiple sender processes, they all worked on the same campaign
- Campaigns queued behind each other

### After (New Behavior)
- Multiple campaigns can be processed simultaneously
- Each sender process can work on different campaigns
- Significantly faster campaign delivery when running multiple campaigns

## Configuration

### 1. Enable Redis (Required for Multiple Processes)

Edit your production config file (e.g., `config/production.toml`):

```toml
[redis]
enabled=true
host="localhost"
port=6379
db=5
```

### 2. Configure Sender Processes

```toml
[queue]
# Number of parallel sender processes
# Each process can handle multiple campaigns independently
processes=4

# Maximum campaigns to process in parallel per sender process
# 0 = unlimited (all active campaigns)
# 1 = original behavior (one campaign at a time)
# 5 = process up to 5 campaigns simultaneously
maxParallelCampaigns=0
```

### 3. Configure SMTP Connection Pool

Increase the SMTP connection pool to handle parallel campaigns:

In your Mailtrain settings (http://your-domain/settings):
- **Max Connections**: 10-20 (default was 4)
- **Max Messages**: 100-1000 (messages per connection before reconnecting)
- **Throttling**: Set based on your SMTP provider's limits

## Recommended Configurations

### Small Setup (1-2 campaigns at once)
```toml
[queue]
processes=1
maxParallelCampaigns=2
```
SMTP Max Connections: 5

### Medium Setup (3-5 campaigns at once)
```toml
[redis]
enabled=true

[queue]
processes=2
maxParallelCampaigns=5
```
SMTP Max Connections: 10-15

### Large Setup (Unlimited campaigns)
```toml
[redis]
enabled=true

[queue]
processes=4
maxParallelCampaigns=0
```
SMTP Max Connections: 20+

## Performance Considerations

1. **SMTP Provider Limits**: Ensure your SMTP provider supports the increased connection count
2. **Server Resources**: More processes = more CPU and memory usage
3. **Database Load**: Parallel campaigns increase database queries
4. **Network Bandwidth**: Monitor outbound bandwidth usage

## Monitoring

Monitor your sender processes:
```bash
# Check running sender processes
ps aux | grep sender.js

# Monitor logs
tail -f /path/to/mailtrain/logs
```

## Troubleshooting

### Campaigns not sending in parallel
- Verify Redis is enabled and running
- Check `processes` is > 1 in config
- Ensure `maxParallelCampaigns` is not set to 1

### SMTP connection errors
- Reduce `maxConnections` in settings
- Reduce `processes` or `maxParallelCampaigns`
- Check SMTP provider rate limits

### High CPU usage
- Reduce number of `processes`
- Limit `maxParallelCampaigns` to a specific number

## Migration from Old Version

The changes are backward compatible. By default:
- If `maxParallelCampaigns` is not set, it defaults to 0 (unlimited)
- If you want the old behavior, set `maxParallelCampaigns=1`

## Technical Details

### Modified Files
1. `services/sender.js` - Campaign query logic updated to support multiple campaigns
2. `config/default.toml` - Added `maxParallelCampaigns` configuration option

### How Parallel Processing Works
1. Each sender process queries for active campaigns (limited by `maxParallelCampaigns`)
2. Multiple campaigns are loaded into the Redis cache
3. Each process picks subscribers from different campaigns
4. Emails are sent using the connection pool (limited by `maxConnections`)
5. The cycle continues until all campaigns are complete

## Example Scenario

With the following configuration:
- 3 sender processes
- maxParallelCampaigns = 0 (unlimited)
- 5 active campaigns

Result:
- Process 1 works on campaigns 1, 2
- Process 2 works on campaigns 3, 4
- Process 3 works on campaign 5
- All campaigns send simultaneously with proper load distribution
